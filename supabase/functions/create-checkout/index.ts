const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface CheckoutRequest {
  venueId: string;
  tableOptionId: string;
  guests: number;
  date: string;
  time: string;
  promoCode?: string;
  venueStripeAccountId?: string;
  tableName: string;
  venueName: string;
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
    // Extract userId from the Authorization JWT instead of trusting the client
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Missing or invalid Authorization header" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }
    const jwt = authHeader.replace("Bearer ", "");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase env vars not configured");
    }
    const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: { apikey: supabaseServiceKey, Authorization: `Bearer ${jwt}` },
    });
    if (!userRes.ok) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }
    const authUser = await userRes.json();
    const userId: string = authUser.id;

    const {
      venueId,
      tableOptionId,
      guests,
      date,
      time,
      promoCode,
      venueStripeAccountId,
      tableName,
      venueName,
    }: CheckoutRequest = await req.json();

    if (!venueId || !tableOptionId || !guests || !date || !time) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Look up the price server-side from the table_options table
    const tableOptionRes = await fetch(
      `${supabaseUrl}/rest/v1/table_options?select=price&id=eq.${encodeURIComponent(tableOptionId)}&limit=1`,
      {
        headers: {
          apikey: supabaseServiceKey,
          Authorization: `Bearer ${supabaseServiceKey}`,
          "Content-Type": "application/json",
        },
      },
    );
    if (!tableOptionRes.ok) {
      throw new Error("Failed to look up table option price");
    }
    const tableOptions = await tableOptionRes.json();
    if (!tableOptions || tableOptions.length === 0) {
      return new Response(
        JSON.stringify({ error: "Table option not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }
    const price: number = tableOptions[0].price;

    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }

    const appUrl = Deno.env.get("APP_URL") || "http://localhost:3000";

    // Resolve promo code discount
    let finalPrice = price;
    let couponId: string | undefined;

    if (promoCode) {
      const promoRes = await fetch(
        `https://api.stripe.com/v1/promotion_codes?code=${encodeURIComponent(promoCode)}&active=true&limit=1`,
        {
          headers: {
            Authorization: `Bearer ${stripeSecretKey}`,
          },
        },
      );

      const promoData = await promoRes.json();

      if (promoData.data && promoData.data.length > 0) {
        const promotion = promoData.data[0];
        couponId = promotion.coupon?.id;
        const coupon = promotion.coupon;

        if (coupon) {
          if (coupon.percent_off) {
            finalPrice = Math.round(price * (1 - coupon.percent_off / 100));
          } else if (coupon.amount_off) {
            finalPrice = Math.max(0, price - coupon.amount_off);
          }
        }
      } else {
        return new Response(
          JSON.stringify({ error: "Invalid or expired promo code" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
    }

    // Build form-encoded body for Stripe Checkout Session
    const params = new URLSearchParams();
    params.append("mode", "payment");
    params.append("success_url", `${appUrl}/booking/confirmation?session_id={CHECKOUT_SESSION_ID}`);
    params.append("cancel_url", `${appUrl}/venues/${venueId}?canceled=true`);
    params.append("line_items[0][price_data][currency]", "usd");
    params.append("line_items[0][price_data][product_data][name]", `${tableName} at ${venueName}`);
    params.append(
      "line_items[0][price_data][product_data][description]",
      `${guests} guests on ${date} at ${time}`,
    );
    params.append("line_items[0][price_data][unit_amount]", String(finalPrice));
    params.append("line_items[0][quantity]", "1");
    params.append("metadata[venueId]", venueId);
    params.append("metadata[tableOptionId]", tableOptionId);
    params.append("metadata[guests]", String(guests));
    params.append("metadata[date]", date);
    params.append("metadata[time]", time);
    params.append("metadata[userId]", userId);

    if (promoCode) {
      params.append("metadata[promoCode]", promoCode);
    }

    if (couponId) {
      params.append("discounts[0][coupon]", couponId);
      // When using discounts, pass the original price — Stripe applies the coupon.
      params.set("line_items[0][price_data][unit_amount]", String(price));
    }

    if (venueStripeAccountId) {
      params.append(
        "payment_intent_data[transfer_data][destination]",
        venueStripeAccountId,
      );
    }

    const stripeRes = await fetch(
      "https://api.stripe.com/v1/checkout/sessions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${stripeSecretKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      },
    );

    const session = await stripeRes.json();

    if (!stripeRes.ok) {
      console.error("Stripe error:", JSON.stringify(session));
      return new Response(
        JSON.stringify({
          error: session.error?.message || "Failed to create checkout session",
        }),
        {
          status: stripeRes.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    return new Response(
      JSON.stringify({ url: session.url, sessionId: session.id }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    console.error("Checkout error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
