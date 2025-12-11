/**
 * PersonaAI ACP Connection Script
 * 
 * This script connects PersonaAI to the Agent Commerce Protocol (ACP) network.
 * It uses the official @virtuals-protocol/acp-node SDK.
 * 
 * Usage: node connect-agent.js
 * 
 * Required environment variables:
 * - ACP_API_KEY: Your session entity key ID from console.game.virtuals.io
 * - AGENT_WALLET_PRIVATE_KEY: Private key for the whitelisted wallet (without 0x prefix)
 * - AGENT_WALLET_ADDRESS: Address of the whitelisted wallet
 * - JOB_EXECUTION_WEBHOOK: URL of the edge function that executes jobs
 * 
 * Optional:
 * - RPC_URL: Custom RPC endpoint for gas fee estimates
 * - ACP_ENVIRONMENT: 'sandbox' or 'mainnet' (default: sandbox)
 */

// Import per official documentation: https://github.com/Virtual-Protocol/acp-node
import AcpClient, { AcpContractClient, baseSepoliaAcpConfig, baseAcpConfig } from '@virtuals-protocol/acp-node';
import dotenv from 'dotenv';

dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
  'ACP_API_KEY',
  'AGENT_WALLET_PRIVATE_KEY', 
  'AGENT_WALLET_ADDRESS',
  'JOB_EXECUTION_WEBHOOK'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

// Configuration
const config = {
  apiKey: process.env.ACP_API_KEY,  // This is the session-entity-key-id
  walletPrivateKey: process.env.AGENT_WALLET_PRIVATE_KEY,
  walletAddress: process.env.AGENT_WALLET_ADDRESS,
  rpcUrl: process.env.RPC_URL || undefined,
  environment: process.env.ACP_ENVIRONMENT || 'sandbox',
  jobExecutionWebhook: process.env.JOB_EXECUTION_WEBHOOK
};

// Select ACP config based on environment
const acpConfig = config.environment === 'mainnet' ? baseAcpConfig : baseSepoliaAcpConfig;

console.log('🚀 PersonaAI ACP Connector');
console.log('========================');
console.log('Wallet:', config.walletAddress);
console.log('Environment:', config.environment);
console.log('Webhook:', config.jobExecutionWebhook);
console.log('');

// Track active jobs for logging
const activeJobs = new Map();

async function logDeliveryAttempt(jobId, deliverable, attemptType, deliverError = null) {
  try {
    const value = deliverable.value;
    const parsed = typeof value === 'string' ? JSON.parse(value) : value;
    const payloadStr = typeof value === 'string' ? value : JSON.stringify(value);
    
    await fetch('https://wgerdrdsuusnrdnwwelt.supabase.co/functions/v1/log-acp-delivery', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndnZXJkcmRzdXVzbnJkbnd3ZWx0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIxODkxMjAsImV4cCI6MjA1Nzc2NTEyMH0.yAoqtSbNo7gabNOSyDrNGNjIUaMIPwyhevV2F-IQHbY'
      },
      body: JSON.stringify({
        job_id: String(jobId),
        attempt_type: attemptType,
        payload_type: deliverable.type,
        payload_size_bytes: payloadStr.length,
        payload_keys: typeof parsed === 'object' && parsed !== null ? Object.keys(parsed) : [],
        study_results_keys: parsed?.study_results ? Object.keys(parsed.study_results) : [],
        summary_report_keys: parsed?.study_results?.summary_report ? Object.keys(parsed.study_results.summary_report) : [],
        has_qualitative_report: !!parsed?.study_results?.summary_report?.qualitative_report,
        full_payload_preview: payloadStr.substring(0, 5000),
        deliver_error: deliverError
      })
    });
    console.log(`📝 Logged delivery: ${attemptType}, size: ${payloadStr.length} bytes`);
  } catch (e) {
    console.log('⚠️ Failed to log delivery:', e.message);
  }
}

/**
 * PRECHECK: Fast check if we can fulfill a job BEFORE accepting it
 * This prevents accepting jobs we can't complete (user won't be charged)
 */
async function precheckJob(job) {
  console.log(`🔍 [PRECHECK] Checking if we can fulfill job ${job.id}...`);
  
  try {
    const payload = {
      action: 'precheck',
      job_id: job.id,
      ...job.serviceRequirement
    };
    
    const response = await fetch(config.jobExecutionWebhook, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-ACP-Job-ID': job.id
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`⚠️ [PRECHECK] Webhook error: ${response.status} - ${errorText}`);
      // On error, be conservative and reject
      return { can_fulfill: false, reason: `Precheck failed: ${errorText}` };
    }

    const result = await response.json();
    console.log(`🔍 [PRECHECK] Result:`, JSON.stringify(result, null, 2));
    
    return {
      can_fulfill: result.can_fulfill === true,
      reason: result.reason || 'Unknown',
      match_count: result.match_count || 0,
      requested_count: result.requested_count || 0
    };
  } catch (error) {
    console.log(`⚠️ [PRECHECK] Error: ${error.message}`);
    // On error, be conservative and reject
    return { can_fulfill: false, reason: `Precheck error: ${error.message}` };
  }
}

async function executeJob(job) {
  console.log(`\n📋 Job Details:`);
  console.log(`   ID: ${job.id}`);
  console.log(`   Memo ID: ${job.memoId}`);
  console.log(`   Service Requirement:`, JSON.stringify(job.serviceRequirement, null, 2));
  
  try {
    // Flatten serviceRequirement fields to root level for edge function compatibility
    const payload = {
      job_id: job.id,
      memo_id: job.memoId,
      ...job.serviceRequirement,  // Spread persona_criteria, questions, etc. to root level
      timestamp: new Date().toISOString()
    };
    
    console.log(`   Webhook Payload:`, JSON.stringify(payload, null, 2));
    
    // Forward job to execution webhook
    const response = await fetch(config.jobExecutionWebhook, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-ACP-Job-ID': job.id
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Webhook returned ${response.status}: ${errorText}`);
    }

    let result = await response.json();

    // Handle async processing (202 Accepted with status: processing)
    if (response.status === 202 && result.status === 'processing') {
      console.log(`⏳ Job ${job.id} processing asynchronously, polling for results...`);
      
      const MAX_POLL_TIME = 10 * 60 * 1000; // 10 minutes max
      const POLL_INTERVAL = 5000; // 5 seconds
      const startTime = Date.now();

      while (Date.now() - startTime < MAX_POLL_TIME) {
        await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
        
        const statusResponse = await fetch(config.jobExecutionWebhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'status', job_id: job.id })
        });
        
        result = await statusResponse.json();
        
        // Log progress updates
        if (result.progress) {
          console.log(`   📊 ${result.progress.percent || 0}% - ${result.progress.message || 'Processing...'}`);
        }
        
        if (result.status === 'completed') {
          console.log(`✅ Job ${job.id} completed after ${Math.round((Date.now() - startTime) / 1000)}s`);
          return result; // Return the full results object (contains study_results)
        }
        
        // Check for should_reject flag (job failed during execution)
        if (result.status === 'rejected' || result.should_reject === true) {
          const error = new Error(result.rejection_reason || result.error || 'Job rejected during execution');
          error.should_reject = true;
          error.rejection_reason = result.rejection_reason || result.error;
          throw error;
        }
        
        if (result.status === 'failed') {
          throw new Error(result.error || 'Job failed');
        }
      }

      throw new Error(`Job timed out after ${MAX_POLL_TIME / 1000} seconds`);
    }

    // For synchronous responses (direct completion or cached)
    console.log(`✅ Job ${job.id} executed successfully`);
    return result;
  } catch (error) {
    console.error(`❌ Job ${job.id} execution failed:`, error.message);
    throw error;
  }
}

async function main() {
  console.log('📡 Building ACP Contract Client...');
  
  try {
    // Build the ACP Contract Client
    // Parameters: privateKey, sessionEntityKeyId, walletAddress, rpcUrl?, config?
    const acpContractClient = await AcpContractClient.build(
      config.walletPrivateKey,  // First: wallet private key
      config.apiKey,            // Second: session entity key ID (ACP_API_KEY)
      config.walletAddress,     // Third: wallet address
      config.rpcUrl,            // Fourth: optional RPC URL
      acpConfig                 // Fifth: optional chain config
    );
    
    console.log('✅ Contract client built successfully');
    
    // Create the ACP Client with callbacks
    const acpClient = new AcpClient({
      acpContractClient,
      
      // Called when a new job/task is received
      onNewTask: async (job) => {
        console.log(`\n📥 NEW JOB REQUEST: ${job.id}`);
        console.log(`   Full job object:`, JSON.stringify(job, null, 2));
        activeJobs.set(job.id, { status: 'received', receivedAt: new Date() });
        
        try {
          // ============= PRECHECK BEFORE ACCEPTING =============
          // This is critical: we check if we can fulfill the job BEFORE accepting
          // If we can't fulfill, we reject immediately (user won't be charged)
          console.log(`\n🔍 Step 1: PRECHECK - Can we fulfill this job?`);
          const precheckResult = await precheckJob(job);
          
          if (!precheckResult.can_fulfill) {
            console.log(`❌ PRECHECK FAILED: ${precheckResult.reason}`);
            console.log(`   Rejecting job BEFORE acceptance (user won't be charged)`);
            
            // REJECT the job - this is the proper ACP protocol
            await acpClient.respondJob(job.id, job.memoId, false, precheckResult.reason);
            activeJobs.get(job.id).status = 'rejected_precheck';
            activeJobs.get(job.id).rejection_reason = precheckResult.reason;
            
            console.log(`✅ Job ${job.id} properly REJECTED via ACP protocol`);
            return; // Stop processing this job
          }
          
          console.log(`✅ PRECHECK PASSED: ${precheckResult.reason}`);
          console.log(`   Found ${precheckResult.match_count} potential personas (need ${precheckResult.requested_count})`);
          
          // ============= ACCEPT THE JOB =============
          console.log(`\n📋 Step 2: ACCEPT - Accepting job...`);
          await acpClient.respondJob(job.id, job.memoId, true, 'PersonaAI ready to process');
          activeJobs.get(job.id).status = 'accepted';
          console.log(`✅ Job ${job.id} accepted`);
          
          // ============= EXECUTE THE JOB =============
          console.log(`\n⚙️ Step 3: EXECUTE - Running research...`);
          const result = await executeJob(job);
          activeJobs.get(job.id).status = 'executed';
          
          // ============= DELIVER THE RESULT =============
          console.log(`\n📦 Step 4: DELIVER - Sending results...`);
          
          const studyResults = result.study_results || result.deliverable?.study_results || {};
          const deliverableData = {
            job_id: String(job.id),
            status: 'completed',
            results_url: `https://persona-ai.lovable.app/acp-results/${job.id}`,
            personas_interviewed: studyResults.personas_interviewed || 0,
            questions_asked: studyResults.questions_asked || 0,
            message: 'View full research results at the URL above'
          };
          
          const deliverablePayload = {
            type: "json",
            value: JSON.stringify(deliverableData)
          };
          console.log(`   Deliverable type: ${deliverablePayload.type}`);
          console.log(`   Deliverable size: ${deliverablePayload.value.length} bytes`);
          console.log(`   Results URL: ${deliverableData.results_url}`);
          
          // Log BEFORE delivery attempt
          await logDeliveryAttempt(job.id, deliverablePayload, 'before_deliver');
          
          try {
            await acpClient.deliverJob(job.id, deliverablePayload);
            await logDeliveryAttempt(job.id, deliverablePayload, 'success');
            activeJobs.get(job.id).status = 'delivered';
            console.log(`\n✅✅✅ Job ${job.id} COMPLETED SUCCESSFULLY ✅✅✅`);
          } catch (deliverError) {
            await logDeliveryAttempt(job.id, deliverablePayload, 'failed', deliverError.message);
            throw deliverError; // Re-throw to hit outer catch
          }
          
        } catch (error) {
          console.error(`\n❌ Error processing job ${job.id}:`, error.message);
          activeJobs.get(job.id).status = 'failed';
          activeJobs.get(job.id).error = error.message;
          
          // Log the error
          const errorDeliverable = { 
            type: "text", 
            value: `Research execution failed: ${error.message}` 
          };
          await logDeliveryAttempt(job.id, errorDeliverable, 'error_fallback', error.message);
          
          // Note: If we already accepted the job, we can't reject it anymore
          // The job will fail and the user may still be charged
          // This is why PRECHECK is so important - reject BEFORE accepting
          console.log(`⚠️ Job ${job.id} failed after acceptance - user may be charged`);
          console.log(`   Error: ${error.message}`);
          
          // If the error has should_reject flag, log it
          if (error.should_reject) {
            console.log(`   This error indicates the job should have been rejected`);
            console.log(`   Rejection reason: ${error.rejection_reason}`);
          }
        }
      },
      
      // Called when a job needs evaluation (if we're acting as evaluator)
      onEvaluate: async (job) => {
        console.log(`\n📋 EVALUATION REQUEST: ${job.id}`);
        console.log(`   Deliverable:`, job.deliverable);
        console.log(`   Service Requirement:`, job.serviceRequirement);
        
        // For now, auto-approve evaluations
        try {
          await job.evaluate(true, 'Deliverable meets requirements');
          console.log(`✅ Job ${job.id} evaluation submitted: APPROVED`);
        } catch (error) {
          console.error(`❌ Evaluation failed:`, error.message);
        }
      }
    });
    
    // Initialize the client
    console.log('📡 Initializing ACP Client...');
    await acpClient.init();
    
    console.log('');
    console.log('═══════════════════════════════════════════');
    console.log('✅ PersonaAI is now ONLINE on ACP!');
    console.log('═══════════════════════════════════════════');
    console.log('');
    console.log('💚 Listening for job requests...');
    console.log('   Press Ctrl+C to disconnect');
    console.log('');
    console.log('📋 Job Flow:');
    console.log('   1. PRECHECK - Check if we can fulfill before accepting');
    console.log('   2. ACCEPT   - Accept job (only if precheck passes)');
    console.log('   3. EXECUTE  - Run the research');
    console.log('   4. DELIVER  - Send results to buyer');
    console.log('');
    
    // Keep the process alive
    process.on('SIGINT', async () => {
      console.log('\n');
      console.log('🛑 Shutting down PersonaAI ACP connection...');
      
      // Log active job status
      if (activeJobs.size > 0) {
        console.log('\n📊 Job Summary:');
        for (const [jobId, info] of activeJobs) {
          console.log(`   ${jobId}: ${info.status}${info.rejection_reason ? ` (${info.rejection_reason})` : ''}`);
        }
      }
      
      console.log('');
      console.log('👋 PersonaAI is now offline');
      process.exit(0);
    });
    
    // Periodic status report
    setInterval(() => {
      const now = new Date();
      const jobStats = {
        total: activeJobs.size,
        rejected: [...activeJobs.values()].filter(j => j.status === 'rejected_precheck').length,
        delivered: [...activeJobs.values()].filter(j => j.status === 'delivered').length,
        failed: [...activeJobs.values()].filter(j => j.status === 'failed').length
      };
      console.log(`\n💓 [${now.toISOString()}] PersonaAI heartbeat`);
      console.log(`   Jobs: ${jobStats.total} total, ${jobStats.delivered} delivered, ${jobStats.rejected} rejected, ${jobStats.failed} failed`);
    }, 60000); // Every minute
    
  } catch (error) {
    console.error('');
    console.error('❌ Failed to connect to ACP:');
    console.error('   ', error.message);
    console.error('');
    console.error('Troubleshooting:');
    console.error('1. Verify ACP_API_KEY is correct (session entity key ID from console.game.virtuals.io)');
    console.error('2. Ensure wallet is whitelisted in Service Registry');
    console.error('3. Check if using correct environment (sandbox vs mainnet)');
    console.error('4. Verify wallet private key does not have 0x prefix');
    console.error('');
    process.exit(1);
  }
}

// Start the connection
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
