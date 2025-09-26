
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@3.2.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface FeedbackEmailRequest {
  userEmail: string;
  walletAddress: string;
  feedback: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userEmail, walletAddress, feedback }: FeedbackEmailRequest = await req.json();

    const emailResponse = await resend.emails.send({
      from: "PersonaAI Feedback <noreply@sparkwave-ai.com>",
      to: ["info@sparkwave-ai.com"],
      subject: "New $PRSNA Feedback Received",
      html: `
        <h1>New Feedback from PersonaAI User</h1>
        <p><strong>User Email:</strong> ${userEmail}</p>
        <p><strong>Wallet Address:</strong> ${walletAddress}</p>
        <h3>Feedback:</h3>
        <div style="padding: 15px; background-color: #f5f5f5; border-radius: 5px; margin: 10px 0;">
          ${feedback.replace(/\n/g, '<br>')}
        </div>
        <hr>
        <p style="color: #666; font-size: 12px;">
          This feedback was submitted through the PersonaAI /prsna page feedback form.
        </p>
      `,
    });

    console.log("Feedback email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-prsna-feedback function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
