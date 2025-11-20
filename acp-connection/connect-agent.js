import { ACPClient } from '@virtuals-protocol/acp-sdk';
import dotenv from 'dotenv';

dotenv.config();

// Configuration
const config = {
  entityId: process.env.AGENT_ENTITY_ID,
  walletPrivateKey: process.env.AGENT_WALLET_PRIVATE_KEY,
  walletAddress: process.env.AGENT_WALLET_ADDRESS,
  environment: process.env.ACP_ENVIRONMENT || 'sandbox'
};

console.log('🚀 Connecting PersonaAI to ACP...');
console.log('Entity ID:', config.entityId);
console.log('Wallet:', config.walletAddress);
console.log('Environment:', config.environment);

// Initialize ACP client
const acpClient = new ACPClient(config);

// Connect to ACP backend
async function connectAgent() {
  try {
    console.log('📡 Establishing connection to ACP backend...');
    
    // Register as active provider
    await acpClient.connect();
    
    console.log('✅ PersonaAI is now ONLINE and discoverable!');
    console.log('🔍 Butler should now be able to find PersonaAI in Sandbox mode');
    
    // Listen for incoming job requests
    acpClient.on('job:request', async (jobRequest) => {
      console.log('📥 Received job request:', jobRequest.id);
      
      // Forward to job execution webhook
      try {
        const response = await fetch(process.env.JOB_EXECUTION_WEBHOOK, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(jobRequest)
        });
        
        const result = await response.json();
        console.log('✅ Job completed:', result);
        
        // Submit job result back to ACP
        await acpClient.submitJobResult(jobRequest.id, result);
        
      } catch (error) {
        console.error('❌ Job execution failed:', error);
        await acpClient.submitJobError(jobRequest.id, error.message);
      }
    });
    
    // Keep connection alive
    console.log('💚 PersonaAI is listening for job requests...');
    console.log('Press Ctrl+C to disconnect');
    
  } catch (error) {
    console.error('❌ Connection failed:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Disconnecting PersonaAI from ACP...');
  await acpClient.disconnect();
  console.log('👋 PersonaAI is now offline');
  process.exit(0);
});

// Start connection
connectAgent();
