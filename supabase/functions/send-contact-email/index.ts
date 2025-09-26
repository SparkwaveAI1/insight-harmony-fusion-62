
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@3.2.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContactFormData {
  name: string;
  email: string;
  company?: string;
  message: string;
  formType: string;
  source?: string;
  walletAddress?: string;
  feedback?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData: ContactFormData = await req.json();
    const { name, email, company, message, formType, source, walletAddress, feedback } = formData;
    
    // Validate required fields based on form type
    if (!name || !email) {
      return new Response(
        JSON.stringify({ error: "Name and email are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Handle different form types
    let subject = "";
    let emailContent = "";

    switch (formType) {
      case "prsna-feedback":
        if (!feedback) {
          return new Response(
            JSON.stringify({ error: "Feedback is required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        subject = `New $PRSNA Feedback from ${name}`;
        emailContent = `
          <h2>New $PRSNA Feedback</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          ${walletAddress ? `<p><strong>Wallet Address:</strong> ${walletAddress}</p>` : ""}
          <p><strong>Feedback:</strong></p>
          <p>${feedback.replace(/\n/g, '<br>')}</p>
        `;
        break;

      case "landing-page-lead":
        subject = `New Lead from ${source || 'Landing Page'} - ${name}`;
        emailContent = `
          <h2>New Lead Generated</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          ${company ? `<p><strong>Company:</strong> ${company}</p>` : ""}
          <p><strong>Source:</strong> ${source || 'Landing Page'}</p>
          <p><strong>Form Type:</strong> ${formType}</p>
        `;
        break;

      case "discovery":
        subject = `New Discovery Call Request from ${name}`;
        emailContent = `
          <h2>New Discovery Call Request</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          ${company ? `<p><strong>Company:</strong> ${company}</p>` : ""}
          <p><strong>Message:</strong></p>
          <p>${message?.replace(/\n/g, '<br>') || 'No message provided'}</p>
        `;
        break;

      case "demo":
        subject = `New Demo Request from ${name}`;
        emailContent = `
          <h2>New Demo Request</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          ${company ? `<p><strong>Company:</strong> ${company}</p>` : ""}
          <p><strong>Message:</strong></p>
          <p>${message?.replace(/\n/g, '<br>') || 'No message provided'}</p>
        `;
        break;

      case "custom-persona":
        subject = `Custom Persona Project Inquiry from ${name}`;
        emailContent = `
          <h2>Custom Persona Project Inquiry</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          ${company ? `<p><strong>Company:</strong> ${company}</p>` : ""}
          <p><strong>Requirements:</strong></p>
          <p>${message?.replace(/\n/g, '<br>') || 'No requirements provided'}</p>
        `;
        break;

      default:
        subject = `New Contact Form Submission from ${name}`;
        emailContent = `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          ${company ? `<p><strong>Company:</strong> ${company}</p>` : ""}
          <p><strong>Message:</strong></p>
          <p>${message?.replace(/\n/g, '<br>') || 'No message provided'}</p>
          <p><strong>Form Type:</strong> ${formType}</p>
        `;
    }

    // Send email using Resend with verified sender
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
