const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface PushRequest {
  userId: string;
  title: string;
  body: string;
  url?: string;
}

interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

function base64UrlEncode(data: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...data));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function createVapidAuthHeader(
  endpoint: string,
  vapidPrivateKey: string,
  vapidPublicKey: string,
  subject: string,
): Promise<{ authorization: string; cryptoKey: string }> {
  const audience = new URL(endpoint).origin;

  // JWT header
  const header = base64UrlEncode(
    new TextEncoder().encode(JSON.stringify({ typ: "JWT", alg: "ES256" })),
  );

  // JWT payload
  const now = Math.floor(Date.now() / 1000);
  const payload = base64UrlEncode(
    new TextEncoder().encode(
      JSON.stringify({
        aud: audience,
        exp: now + 12 * 60 * 60, // 12 hours
        sub: subject,
      }),
    ),
  );

  const unsignedToken = `${header}.${payload}`;

  // Import the VAPID private key for signing
  const privateKeyBytes = Uint8Array.from(
    atob(vapidPrivateKey.replace(/-/g, "+").replace(/_/g, "/")),
    (c) => c.charCodeAt(0),
  );

  const key = await crypto.subtle.importKey(
    "pkcs8",
    privateKeyBytes,
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"],
  );

  const signatureBuffer = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    key,
    new TextEncoder().encode(unsignedToken),
  );

  // Convert DER signature to raw r||s format for JWT
  const signatureArray = new Uint8Array(signatureBuffer);
  let signature: Uint8Array;

  if (signatureArray.length === 64) {
    signature = signatureArray;
  } else {
    // Parse DER-encoded signature
    const r = parseDerInteger(signatureArray, 2);
    const sOffset = 2 + signatureArray[1 + 2] + 2;
    const s = parseDerInteger(signatureArray, sOffset);
    signature = new Uint8Array(64);
    signature.set(padTo32(r), 0);
    signature.set(padTo32(s), 32);
  }

  const sig = base64UrlEncode(signature);
  const jwt = `${unsignedToken}.${sig}`;

  return {
    authorization: `vapid t=${jwt}, k=${vapidPublicKey}`,
    cryptoKey: `p256ecdsa=${vapidPublicKey}`,
  };
}

function parseDerInteger(buf: Uint8Array, offset: number): Uint8Array {
  // offset points to 0x02 tag
  const len = buf[offset + 1];
  return buf.slice(offset + 2, offset + 2 + len);
}

function padTo32(bytes: Uint8Array): Uint8Array {
  if (bytes.length === 32) return bytes;
  if (bytes.length > 32) return bytes.slice(bytes.length - 32);
  const padded = new Uint8Array(32);
  padded.set(bytes, 32 - bytes.length);
  return padded;
}

async function sendWebPush(
  subscription: PushSubscription,
  payload: string,
  vapidPrivateKey: string,
  vapidPublicKey: string,
  vapidSubject: string,
): Promise<{ success: boolean; status: number; statusText: string }> {
  const { authorization, cryptoKey } = await createVapidAuthHeader(
    subscription.endpoint,
    vapidPrivateKey,
    vapidPublicKey,
    vapidSubject,
  );

  const res = await fetch(subscription.endpoint, {
    method: "POST",
    headers: {
      Authorization: authorization,
      "Crypto-Key": cryptoKey,
      "Content-Type": "application/json",
      "Content-Encoding": "aes128gcm",
      TTL: "86400",
      Urgency: "normal",
    },
    body: payload,
  });

  return {
    success: res.ok,
    status: res.status,
    statusText: res.statusText,
  };
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
    // Verify JWT authentication
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
    const supabaseAuthUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAuthKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (supabaseAuthUrl && supabaseAuthKey) {
      const userRes = await fetch(`${supabaseAuthUrl}/auth/v1/user`, {
        headers: { apikey: supabaseAuthKey, Authorization: `Bearer ${jwt}` },
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
    }

    const { userId, title, body, url }: PushRequest = await req.json();

    if (!userId || !title || !body) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: userId, title, body" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY");
    const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY");
    const vapidSubject = Deno.env.get("VAPID_SUBJECT") || "mailto:hello@parties.app";

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Supabase env vars not configured");
    }
    if (!vapidPrivateKey || !vapidPublicKey) {
      throw new Error("VAPID keys not configured");
    }

    // Fetch push subscriptions for the user
    const subsRes = await fetch(
      `${supabaseUrl}/rest/v1/push_subscriptions?user_id=eq.${encodeURIComponent(userId)}&select=endpoint,keys`,
      {
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
        },
      },
    );

    if (!subsRes.ok) {
      const errBody = await subsRes.text();
      console.error("Failed to fetch subscriptions:", subsRes.status, errBody);
      return new Response(
        JSON.stringify({ error: "Failed to fetch push subscriptions" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const subscriptions: PushSubscription[] = await subsRes.json();

    if (subscriptions.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "No push subscriptions found for user",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const payload = JSON.stringify({ title, body, url });

    const results = await Promise.allSettled(
      subscriptions.map((sub) =>
        sendWebPush(sub, payload, vapidPrivateKey, vapidPublicKey, vapidSubject)
      ),
    );

    const sent = results.filter(
      (r) => r.status === "fulfilled" && r.value.success,
    ).length;
    const failed = results.length - sent;

    // Clean up expired subscriptions (410 Gone)
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      if (
        result.status === "fulfilled" &&
        result.value.status === 410
      ) {
        const endpoint = subscriptions[i].endpoint;
        await fetch(
          `${supabaseUrl}/rest/v1/push_subscriptions?endpoint=eq.${encodeURIComponent(endpoint)}`,
          {
            method: "DELETE",
            headers: {
              apikey: serviceRoleKey,
              Authorization: `Bearer ${serviceRoleKey}`,
            },
          },
        );
        console.log("Removed expired subscription:", endpoint);
      }
    }

    return new Response(
      JSON.stringify({ success: sent > 0, sent, failed }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    console.error("Send-push error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
