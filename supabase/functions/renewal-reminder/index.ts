import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.56.0";
import { Resend } from "https://esm.sh/resend@3.2.0";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

interface RenewalUser {
  id: string;
  email: string;
  renewal_date: string;
  plan_name: string;
  price_usd: number;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("🔔 Starting renewal reminder job at", new Date().toISOString());

    // Query users whose renewal date is exactly 3 days from now
    const { data: renewalUsers, error: queryError } = await supabase.rpc('get_users_renewing_in_days', {
      days_ahead: 3
    });

    if (queryError) {
      // Fallback to direct query if RPC doesn't exist
      console.log("📧 Using fallback query for renewal users");
      
      const { data: users, error: fallbackError } = await supabase
        .from('billing_profiles')
        .select(`
          user_id,
          renewal_date,
          billing_plans!inner(name, price_usd)
        `)
        .eq('auto_renew', true)
        .eq('renewal_date::date', new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

      if (fallbackError) {
        throw new Error(`Failed to query renewal users: ${fallbackError.message}`);
      }

      // Get user emails from auth.users
      const userIds = users?.map(u => u.user_id) || [];
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        throw new Error(`Failed to get user emails: ${authError.message}`);
      }

      const emailMap = new Map(authUsers.users.map(u => [u.id, u.email]));
      
      const renewalData: RenewalUser[] = (users || []).map(u => ({
        id: u.user_id,
        email: emailMap.get(u.user_id) || '',
        renewal_date: u.renewal_date,
        plan_name: (u.billing_plans as any)?.name || '',
        price_usd: (u.billing_plans as any)?.price_usd || 0
      })).filter(u => u.email);

      return await processRenewalUsers(renewalData);
    }

    return await processRenewalUsers(renewalUsers || []);

  } catch (error) {
    console.error("❌ Renewal reminder job failed:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

async function processRenewalUsers(renewalUsers: RenewalUser[]): Promise<Response> {
  console.log(`📊 Found ${renewalUsers.length} users for renewal reminders`);

  if (renewalUsers.length === 0) {
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "No users found for renewal reminders",
        processed: 0 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }

  let sentCount = 0;
  let failedCount = 0;

  for (const user of renewalUsers) {
    try {
      const renewalDate = new Date(user.renewal_date).toLocaleDateString();
      const manageUrl = `https://wgerdrdsuusnrdnwwelt.supabase.co/profile`; // TODO: Update with actual billing management URL

      const emailPayload = {
        from: "PersonaAI <noreply@personaai.com>", // TODO: Update with your verified domain
        to: [user.email],
        subject: `Your PersonaAI plan renews on ${renewalDate}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Renewal Reminder</h2>
            <p>Hi there,</p>
            <p>This is a friendly reminder that your <strong>${user.plan_name}</strong> plan will automatically renew in 3 days.</p>
            
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Renewal Details</h3>
              <p><strong>Plan:</strong> ${user.plan_name}</p>
              <p><strong>Amount:</strong> $${user.price_usd}</p>
              <p><strong>Renewal Date:</strong> ${renewalDate}</p>
            </div>
            
            <p>If you need to make any changes to your subscription, you can manage it here:</p>
            <p><a href="${manageUrl}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Manage Subscription</a></p>
            
            <p>Thanks for using PersonaAI!</p>
            <p>The PersonaAI Team</p>
          </div>
        `
      };

      // Log the email payload (for QC verification)
      console.log("📧 Email payload sample:", {
        to: "[REDACTED]",
        subject: emailPayload.subject,
        plan_name: user.plan_name,
        price_usd: user.price_usd,
        renewal_date: renewalDate
      });

      // Send email via Resend
      const emailResult = await resend.emails.send(emailPayload);

      if (emailResult.error) {
        console.error(`❌ Failed to send renewal reminder to user ${user.id}:`, emailResult.error);
        failedCount++;
      } else {
        console.log(`✅ Sent renewal reminder to user ${user.id}`);
        sentCount++;
      }

    } catch (error) {
      console.error(`❌ Error processing renewal reminder for user ${user.id}:`, error);
      failedCount++;
    }
  }

  return new Response(
    JSON.stringify({
      success: true,
      message: "Renewal reminder job completed",
      processed: renewalUsers.length,
      sent: sentCount,
      failed: failedCount,
      timestamp: new Date().toISOString()
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    }
  );
}

serve(handler);