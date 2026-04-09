const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, stripe-signature",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

async function verifyStripeSignature(
  payload: string,
  sigHeader: string,
  secret: string,
): Promise<boolean> {
  const parts = sigHeader.split(",");
  const timestamp = parts
    .find((p) => p.startsWith("t="))
    ?.substring(2);
  const signatures = parts
    .filter((p) => p.startsWith("v1="))
    .map((p) => p.substring(3));

  if (!timestamp || signatures.length === 0) {
    return false;
  }

  // Reject events older than 5 minutes
  const age = Math.floor(Date.now() / 1000) - parseInt(timestamp, 10);
  if (age > 300) {
    return false;
  }

  const signedPayload = `${timestamp}.${payload}`;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signatureBytes = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(signedPayload),
  );

  const expectedSig = Array.from(new Uint8Array(signatureBytes))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return signatures.some((sig) => constantTimeEqual(sig, expectedSig));
}

async function supabaseRequest(
  path: string,
  method: string,
  body?: Record<string, unknown>,
  extraHeaders?: Record<string, string>,
): Promise<Response> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase env vars not configured");
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    ...extraHeaders,
  };

  const options: RequestInit = { method, headers };
  if (body) {
    options.body = JSON.stringify(body);
  }

  return fetch(`${supabaseUrl}/rest/v1${path}`, options);
}

async function createBooking(session: Record<string, unknown>): Promise<void> {
  const metadata = session.metadata as Record<string, string> | undefined;
  if (!metadata) {
    console.error("No metadata on checkout session");
    return;
  }

  const booking = {
    stripe_session_id: session.id,
    stripe_payment_intent_id: session.payment_intent,
    venue_id: metadata.venueId,
    table_option_id: metadata.tableOptionId,
    user_id: metadata.userId,
    guests: parseInt(metadata.guests, 10),
    date: metadata.date,
    time: metadata.time,
    promo_code: metadata.promoCode || null,
    amount_total: session.amount_total,
    currency: session.currency,
    status: "confirmed",
    created_at: new Date().toISOString(),
  };

  const res = await supabaseRequest("/bookings", "POST", booking, {
    Prefer: "return=representation",
  });

  if (!res.ok) {
    const errBody = await res.text();
    console.error("Failed to create booking:", res.status, errBody);
    return;
  }

  console.log("Booking created for session:", session.id);

  // Trigger push notification for the user
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (supabaseUrl && serviceRoleKey) {
      await fetch(`${supabaseUrl}/functions/v1/send-push`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${serviceRoleKey}`,
        },
        body: JSON.stringify({
          userId: metadata.userId,
          title: "Booking Confirmed!",
          body: `Your table for ${metadata.guests} on ${metadata.date} at ${metadata.time} is confirmed.`,
          url: `/booking/confirmation?session_id=${session.id}`,
        }),
      });
    }
  } catch (pushErr) {
    // Non-fatal: log and continue
    console.error("Failed to send push notification:", pushErr);
  }
}

async function markBookingExpired(
  session: Record<string, unknown>,
): Promise<void> {
  const sessionId = session.id as string;

  const res = await supabaseRequest(
    `/bookings?stripe_session_id=eq.${encodeURIComponent(sessionId)}`,
    "PATCH",
    { status: "expired" },
  );

  if (!res.ok) {
    const errBody = await res.text();
    console.error("Failed to mark booking expired:", res.status, errBody);
    return;
  }

  console.log("Booking marked expired for session:", sessionId);
}

async function markBookingRefunded(
  charge: Record<string, unknown>,
): Promise<void> {
  const paymentIntentId = charge.payment_intent as string;

  const res = await supabaseRequest(
    `/bookings?stripe_payment_intent_id=eq.${encodeURIComponent(paymentIntentId)}`,
    "PATCH",
    { status: "refunded" },
  );

  if (!res.ok) {
    const errBody = await res.text();
    console.error("Failed to mark booking refunded:", res.status, errBody);
    return;
  }

  console.log("Booking marked refunded for payment_intent:", paymentIntentId);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    if (!webhookSecret) {
      throw new Error("STRIPE_WEBHOOK_SECRET is not configured");
    }

    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      return new Response(
        JSON.stringify({ error: "Missing stripe-signature header" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const rawBody = await req.text();
    const isValid = await verifyStripeSignature(rawBody, signature, webhookSecret);

    if (!isValid) {
      return new Response(
        JSON.stringify({ error: "Invalid signature" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const event = JSON.parse(rawBody);
    console.log("Stripe event received:", event.type, event.id);

    switch (event.type) {
      case "checkout.session.completed":
        await createBooking(event.data.object);
        break;

      case "checkout.session.expired":
        await markBookingExpired(event.data.object);
        break;

      case "charge.refunded":
        await markBookingRefunded(event.data.object);
        break;

      default:
        console.log("Unhandled event type:", event.type);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response(
      JSON.stringify({ error: "Webhook handler failed" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
