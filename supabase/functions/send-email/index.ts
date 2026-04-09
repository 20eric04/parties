const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type EmailType = "application_received" | "application_approved" | "application_rejected" | "welcome";

interface EmailRequest {
  type: EmailType;
  to: string;
  name: string;
  data?: Record<string, unknown>;
}

function baseLayout(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>PARTIES</title>
</head>
<body style="margin:0;padding:0;background-color:#0A0A0A;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0A0A0A;">
<tr><td align="center" style="padding:40px 20px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

<!-- Logo -->
<tr><td align="center" style="padding:0 0 40px 0;">
<table role="presentation" cellpadding="0" cellspacing="0">
<tr><td style="font-family:Georgia,'Times New Roman',serif;font-size:32px;font-style:italic;letter-spacing:4px;color:#FFFFFF;">PARTIES</td></tr>
</table>
</td></tr>

<!-- Accent line -->
<tr><td align="center" style="padding:0 0 40px 0;">
<table role="presentation" cellpadding="0" cellspacing="0">
<tr><td style="width:40px;height:2px;background-color:#E54D2E;"></td></tr>
</table>
</td></tr>

<!-- Content -->
<tr><td style="padding:0 10px;">
${content}
</td></tr>

<!-- Footer divider -->
<tr><td style="padding:50px 0 0 0;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr><td style="height:1px;background-color:rgba(255,255,255,0.08);"></td></tr>
</table>
</td></tr>

<!-- Footer -->
<tr><td align="center" style="padding:30px 0 0 0;">
<p style="font-family:Georgia,'Times New Roman',serif;font-size:14px;font-style:italic;letter-spacing:3px;color:rgba(255,255,255,0.3);margin:0 0 12px 0;">PARTIES</p>
<p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:11px;color:rgba(255,255,255,0.2);margin:0;line-height:1.6;">
This email was sent by PARTIES. If you believe you received this in error,<br/>
please disregard this message.
</p>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

function ctaButton(text: string, href: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
<tr><td align="center" style="background-color:#E54D2E;border-radius:12px;">
<a href="${href}" target="_blank" style="display:inline-block;padding:16px 40px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;font-weight:600;color:#FFFFFF;text-decoration:none;letter-spacing:0.5px;">${text}</a>
</td></tr>
</table>`;
}

function heading(text: string): string {
  return `<h1 style="font-family:Georgia,'Times New Roman',serif;font-size:28px;font-weight:400;font-style:italic;color:#FFFFFF;margin:0 0 24px 0;text-align:center;line-height:1.3;">${text}</h1>`;
}

function paragraph(text: string): string {
  return `<p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:15px;color:rgba(255,255,255,0.65);line-height:1.7;margin:0 0 20px 0;text-align:center;">${text}</p>`;
}

function accent(text: string): string {
  return `<span style="color:#E54D2E;font-weight:600;">${text}</span>`;
}

function spacer(px: number): string {
  return `<div style="height:${px}px;"></div>`;
}

function getSubject(type: EmailType): string {
  switch (type) {
    case "application_received":
      return "We've Received Your Application";
    case "application_approved":
      return "Welcome to PARTIES";
    case "application_rejected":
      return "Your PARTIES Application";
    case "welcome":
      return "Your Concierge Awaits";
  }
}

function getBody(type: EmailType, name: string, _data?: Record<string, unknown>): string {
  const firstName = name.split(" ")[0];
  const appUrl = "https://parties.app";

  switch (type) {
    case "application_received":
      return baseLayout(`
${heading("Application Received")}
${paragraph(`Thank you, ${accent(firstName)}. We're pleased to confirm that your membership application has been received.`)}
${paragraph(`Our membership committee personally reviews every application to ensure PARTIES remains an extraordinary community. You can expect to hear from us within ${accent("48 hours")}.`)}
${paragraph(`In the meantime, know that you're one step closer to unlocking a world of exclusive access &mdash; from the most coveted tables to private events most never see.`)}
${spacer(10)}
${paragraph(`<span style="font-family:Georgia,'Times New Roman',serif;font-style:italic;color:rgba(255,255,255,0.35);font-size:13px;">We'll be in touch soon.</span>`)}
`);

    case "application_approved":
      return baseLayout(`
${heading("Welcome to PARTIES")}
${paragraph(`Congratulations, ${accent(firstName)}. Your application has been ${accent("approved")}.`)}
${paragraph(`You now have access to everything PARTIES has to offer &mdash; priority VIP table reservations at the world's most exclusive venues, a personal concierge available around the clock, private member events, luxury fleet vehicles, and curated travel experiences.`)}
${paragraph(`Your dedicated concierge is standing by to help you plan your first experience. Whether it's a table for tonight or a private jet next week, we're here to make it happen.`)}
${spacer(16)}
${ctaButton("Open PARTIES", appUrl)}
${spacer(16)}
${paragraph(`<span style="font-family:Georgia,'Times New Roman',serif;font-style:italic;color:rgba(255,255,255,0.35);font-size:13px;">Welcome to the inner circle.</span>`)}
`);

    case "application_rejected":
      return baseLayout(`
${heading("Regarding Your Application")}
${paragraph(`Dear ${firstName},`)}
${paragraph(`Thank you for your interest in PARTIES. After careful review, we are unable to extend membership at this time.`)}
${paragraph(`Our membership is intentionally limited to ensure an unparalleled level of service and exclusivity for our community. This decision does not diminish our appreciation for your interest.`)}
${paragraph(`We welcome you to ${accent("reapply in the future")} as our membership evolves and new opportunities arise. Circumstances change, and we'd be glad to reconsider your application at a later date.`)}
${spacer(10)}
${paragraph(`<span style="font-family:Georgia,'Times New Roman',serif;font-style:italic;color:rgba(255,255,255,0.35);font-size:13px;">With our regards,<br/>The PARTIES Membership Committee</span>`)}
`);

    case "welcome":
      return baseLayout(`
${heading("Your Concierge Awaits")}
${paragraph(`${accent(firstName)}, your PARTIES membership is now fully active. Here's how to make the most of it from day one.`)}
${spacer(8)}

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:30px;">
<tr><td style="padding:20px 24px;border:1px solid rgba(255,255,255,0.08);border-radius:12px;margin-bottom:12px;">
<p style="font-family:Georgia,'Times New Roman',serif;font-size:16px;color:#FFFFFF;margin:0 0 8px 0;font-style:italic;">Message Your Concierge</p>
<p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:13px;color:rgba(255,255,255,0.5);line-height:1.6;margin:0;">Open the app and tap ${accent("Concierge")}. Tell them what you're looking for &mdash; a table tonight, a weekend getaway, or a private event. They handle everything.</p>
</td></tr>
<tr><td style="height:12px;"></td></tr>
<tr><td style="padding:20px 24px;border:1px solid rgba(255,255,255,0.08);border-radius:12px;margin-bottom:12px;">
<p style="font-family:Georgia,'Times New Roman',serif;font-size:16px;color:#FFFFFF;margin:0 0 8px 0;font-style:italic;">Browse Venues</p>
<p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:13px;color:rgba(255,255,255,0.5);line-height:1.6;margin:0;">Explore our curated collection of the world's finest nightlife venues. Reserve VIP tables instantly with member-exclusive pricing.</p>
</td></tr>
<tr><td style="height:12px;"></td></tr>
<tr><td style="padding:20px 24px;border:1px solid rgba(255,255,255,0.08);border-radius:12px;">
<p style="font-family:Georgia,'Times New Roman',serif;font-size:16px;color:#FFFFFF;margin:0 0 8px 0;font-style:italic;">Discover Experiences</p>
<p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:13px;color:rgba(255,255,255,0.5);line-height:1.6;margin:0;">From private dining to luxury fleet rentals and jet charters &mdash; explore the full range of what your membership unlocks.</p>
</td></tr>
</table>

${ctaButton("Get Started", appUrl)}
${spacer(16)}
${paragraph(`<span style="font-family:Georgia,'Times New Roman',serif;font-style:italic;color:rgba(255,255,255,0.35);font-size:13px;">The night is yours.</span>`)}
`);
  }
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
    const { type, to, name, data }: EmailRequest = await req.json();

    // Require authentication for all email types except application_received
    // (applicants are not logged in when they submit)
    if (type !== "application_received") {
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
      if (supabaseUrl && supabaseServiceKey) {
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
      }
    }

    if (!type || !to || !name) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: type, to, name" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const validTypes: EmailType[] = ["application_received", "application_approved", "application_rejected", "welcome"];
    if (!validTypes.includes(type)) {
      return new Response(
        JSON.stringify({ error: `Invalid email type. Must be one of: ${validTypes.join(", ")}` }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const subject = getSubject(type);
    const html = getBody(type, name, data);

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "PARTIES <hello@parties.com>",
        to: [to],
        subject,
        html,
      }),
    });

    const resendData = await resendRes.json();

    if (!resendRes.ok) {
      console.error("Resend API error:", JSON.stringify(resendData));
      return new Response(
        JSON.stringify({
          error: resendData.message || "Failed to send email",
        }),
        {
          status: resendRes.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    console.log("Email sent:", type, to, resendData.id);

    return new Response(
      JSON.stringify({ success: true, id: resendData.id }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    console.error("Send-email error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
