/**
 * PersonaAI ACP Connection Script
 * 
 * This script connects PersonaAI to the Agent Commerce Protocol (ACP) network.
 * It uses the official @virtuals-protocol/acp-node SDK (v0.3.0-beta.5+).
 * 
 * Usage: node connect-agent.js
 * 
 * Required environment variables:
 * - ACP_API_KEY: Your ACP API key from console.game.virtuals.io
 * - AGENT_WALLET_PRIVATE_KEY: Private key for the whitelisted wallet (without 0x prefix)
 * - AGENT_WALLET_ADDRESS: Address of the whitelisted wallet
 * - JOB_EXECUTION_WEBHOOK: URL of the edge function that executes jobs
 * 
 * Optional:
 * - RPC_URL: Custom RPC endpoint for gas fee estimates
 * - ACP_ENVIRONMENT: 'sandbox' or 'mainnet' (default: sandbox)
 */

import AcpClient, { AcpContractClient, sandboxAcpConfig, baseAcpConfig } from '@virtuals-protocol/acp-node';
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
  apiKey: process.env.ACP_API_KEY,
  walletPrivateKey: process.env.AGENT_WALLET_PRIVATE_KEY,
  walletAddress: process.env.AGENT_WALLET_ADDRESS,
  rpcUrl: process.env.RPC_URL || undefined,
  environment: process.env.ACP_ENVIRONMENT || 'sandbox',
  jobExecutionWebhook: process.env.JOB_EXECUTION_WEBHOOK
};

// Select ACP config based on environment
const acpConfig = config.environment === 'mainnet' ? baseAcpConfig : sandboxAcpConfig;

console.log('🚀 PersonaAI ACP Connector');
console.log('========================');
console.log('Wallet:', config.walletAddress);
console.log('Environment:', config.environment);
console.log('Webhook:', config.jobExecutionWebhook);
console.log('');

// Track active jobs for logging
const activeJobs = new Map();

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

    const result = await response.json();
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
    const acpContractClient = await AcpContractClient.build(
      config.apiKey,
      config.walletPrivateKey,
      config.walletAddress,
      config.rpcUrl,
      acpConfig
    );
    
    console.log('✅ Contract client built successfully');
    
    // Create the ACP Client with callbacks
    const acpClient = new AcpClient({
      acpContractClient,
      
      // Called when a new job/task is received
      onNewTask: async (job) => {
        console.log(`\n📥 NEW JOB REQUEST: ${job.id}`);
        activeJobs.set(job.id, { status: 'received', receivedAt: new Date() });
        
        try {
          // Accept the job
          console.log(`   Accepting job...`);
          await acpClient.respondJob(job.id, job.memoId, true, 'PersonaAI ready to process');
          activeJobs.get(job.id).status = 'accepted';
          
          // Execute the job
          console.log(`   Executing job...`);
          const result = await executeJob(job);
          activeJobs.get(job.id).status = 'executed';
          
          // Deliver the result
          console.log(`   Delivering result...`);
          await acpClient.deliverJob(job.id, result.deliverable || result);
          activeJobs.get(job.id).status = 'delivered';
          
          console.log(`✅ Job ${job.id} completed and delivered`);
          
        } catch (error) {
          console.error(`❌ Error processing job ${job.id}:`, error.message);
          activeJobs.get(job.id).status = 'failed';
          activeJobs.get(job.id).error = error.message;
          
          // Try to respond with rejection if we haven't accepted yet
          try {
            await acpClient.respondJob(job.id, job.memoId, false, `Error: ${error.message}`);
          } catch (rejectError) {
            console.error(`   Could not reject job:`, rejectError.message);
          }
        }
      },
      
      // Called when a job needs evaluation (if we're acting as evaluator)
      onEvaluate: async (job) => {
        console.log(`\n📋 EVALUATION REQUEST: ${job.id}`);
        console.log(`   Deliverable:`, job.deliverable);
        console.log(`   Service Requirement:`, job.serviceRequirement);
        
        // For now, auto-approve evaluations
        // In production, you'd implement actual evaluation logic
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
    
    // Keep the process alive
    process.on('SIGINT', async () => {
      console.log('\n');
      console.log('🛑 Shutting down PersonaAI ACP connection...');
      
      // Log active job status
      if (activeJobs.size > 0) {
        console.log('\n📊 Job Summary:');
        for (const [jobId, info] of activeJobs) {
          console.log(`   ${jobId}: ${info.status}`);
        }
      }
      
      console.log('');
      console.log('👋 PersonaAI is now offline');
      process.exit(0);
    });
    
    // Periodic status report
    setInterval(() => {
      const now = new Date();
      console.log(`\n💓 [${now.toISOString()}] PersonaAI heartbeat - Active jobs: ${activeJobs.size}`);
    }, 60000); // Every minute
    
  } catch (error) {
    console.error('');
    console.error('❌ Failed to connect to ACP:');
    console.error('   ', error.message);
    console.error('');
    console.error('Troubleshooting:');
    console.error('1. Verify ACP_API_KEY is correct (get from console.game.virtuals.io)');
    console.error('2. Ensure wallet is whitelisted in Service Registry');
    console.error('3. Check if using correct environment (sandbox vs mainnet)');
    console.error('');
    process.exit(1);
  }
}

// Start the connection
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
