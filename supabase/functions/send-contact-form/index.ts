
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContactFormData {
  name?: string;
  email: string;
  company?: string;
  message: string;
  formType: string;
  walletAddress?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData: ContactFormData = await req.json();
    const { name, email, company, message, formType, walletAddress } = formData;
    
    // Validate required fields
    if (!email || !message) {
      return new Response(
        JSON.stringify({ error: "Email and message are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create email content based on form type
    let subject = "";
    let emailContent = "";

    switch (formType) {
      case "custom-persona":
        subject = `Custom Persona Project Inquiry${name ? ` from ${name}` : ""}`;
        emailContent = `
          <h2>Custom Persona Project Inquiry</h2>
          ${name ? `<p><strong>Name:</strong> ${name}</p>` : ""}
          <p><strong>Email:</strong> ${email}</p>
          ${company ? `<p><strong>Company:</strong> ${company}</p>` : ""}
          ${walletAddress ? `<p><strong>Wallet Address:</strong> ${walletAddress}</p>` : ""}
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, '<br>')}</p>
        `;
        break;

      case "discovery":
        subject = `Discovery Call Request${name ? ` from ${name}` : ""}`;
        emailContent = `
          <h2>Discovery Call Request</h2>
          ${name ? `<p><strong>Name:</strong> ${name}</p>` : ""}
          <p><strong>Email:</strong> ${email}</p>
          ${company ? `<p><strong>Company:</strong> ${company}</p>` : ""}
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, '<br>')}</p>
        `;
        break;

      case "demo":
        subject = `Demo Request${name ? ` from ${name}` : ""}`;
        emailContent = `
          <h2>Demo Request</h2>
          ${name ? `<p><strong>Name:</strong> ${name}</p>` : ""}
          <p><strong>Email:</strong> ${email}</p>
          ${company ? `<p><strong>Company:</strong> ${company}</p>` : ""}
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, '<br>')}</p>
        `;
        break;

      default:
        subject = `Contact Form Submission${name ? ` from ${name}` : ""}`;
        emailContent = `
          <h2>Contact Form Submission</h2>
          ${name ? `<p><strong>Name:</strong> ${name}</p>` : ""}
          <p><strong>Email:</strong> ${email}</p>
          ${company ? `<p><strong>Company:</strong> ${company}</p>` : ""}
          <p><strong>Form Type:</strong> ${formType}</p>
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, '<br>')}</p>
        `;
    }

    // Send email using Resend
    const emailResponse = await resend.emails.send({
      from: "PersonaAI Contact <onboarding@resend.dev>",
      to: "scott@sparkwave-ai.com",
      subject: subject,
      html: emailContent,
      reply_to: email,
    });

    if (emailResponse.error) {
      console.error("Failed to send email:", emailResponse.error);
      throw new Error("Failed to send email");
    }

    console.log("Email sent successfully:", emailResponse.data);

    return new Response(
      JSON.stringify({ success: true, message: "Email sent successfully", id: emailResponse.data?.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing contact form:", error);
    
    return new Response(
      JSON.stringify({ error: "Failed to process contact form submission" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
