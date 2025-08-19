import 'dotenv/config';
import Arcade from '@arcadeai/arcadejs';
import { runPipelineWithHandoffs } from './orchestrator/pipeline';
import { sessionManager } from './state/session';
import { withSmartRetry } from './guardrails/resilience';
import { checkCostLimits } from './guardrails/costs';

async function demoHandoffPipeline() {
  console.log('🎯 Demo: Handoff-Based Pipeline\n');
  
  const client = new Arcade({ apiKey: process.env.ARCADE_API_KEY! });
  
  try {
    // Create a new session
    const projectSession = sessionManager.createSession('demo-runner-habits', 'demo-user-123');
    console.log(`📝 Created session: ${projectSession.id}`);
    console.log(`🏗️  Project: ${projectSession.project.name}`);
    
    // Run the handoff pipeline with retry logic
    const result = await withSmartRetry(
      () => runPipelineWithHandoffs(client, 'demo-user-123', 'demo-runner-habits'),
      { maxRetries: 2, baseDelayMs: 2000 }
    );
    
    if (result.success && result.result) {
      console.log('\n✅ Pipeline completed successfully!');
      console.log(`📊 Status: ${result.result.status}`);
      console.log(`🎭 Phase: ${result.result.phase}`);
      console.log(`🆔 Session: ${result.result.sessionId}`);
      
      // Update session with results
      sessionManager.updateSession(projectSession.id, {
        currentPhase: 'complete',
        status: 'completed'
      });
      
      // Add transcript entry
      sessionManager.addTranscriptEntry(
        projectSession.id,
        'System',
        `Pipeline completed with status: ${result.result.status}`
      );
      
      // Show session summary
      const summary = sessionManager.getSessionSummary(projectSession.id);
      if (summary) {
        console.log('\n📋 Session Summary:');
        console.log(`   Duration: ${summary.duration}s`);
        console.log(`   Cost: $${summary.cost.toFixed(4)}`);
        console.log(`   Artifacts: ${summary.artifactCount}`);
        console.log(`   Transcript entries: ${summary.transcriptLength}`);
      }
      
    } else {
      console.log('\n❌ Pipeline failed after retries');
      console.log(`🔍 Error: ${result.error?.message}`);
      console.log(`🔄 Attempts: ${result.attempts}`);
      
      // Update session status
      sessionManager.updateSession(projectSession.id, {
        status: 'failed'
      });
    }
    
  } catch (error) {
    console.error('💥 Demo failed:', error);
  }
}

async function demoSessionManagement() {
  console.log('\n🎭 Demo: Session Management\n');
  
  try {
    // Create multiple sessions
    const session1 = sessionManager.createSession('project-alpha', 'user-1', 'gpt-4o-mini');
    const session2 = sessionManager.createSession('project-beta', 'user-2', 'gpt-4o');
    
    console.log(`📝 Created session 1: ${session1.id} for ${session1.project.name}`);
    console.log(`📝 Created session 2: ${session2.id} for ${session2.project.name}`);
    
    // Simulate some activity
    sessionManager.addTranscriptEntry(session1.id, 'Researcher', 'Analyzing market trends...');
    sessionManager.addTranscriptEntry(session1.id, 'Architect', 'Designing system architecture...');
    
    sessionManager.addTranscriptEntry(session2.id, 'Coder', 'Setting up repository...');
    sessionManager.addTranscriptEntry(session2.id, 'QA', 'Running test suite...');
    
    // Update costs
    sessionManager.updateCosts(session1.id, 1500, 800, 3);
    sessionManager.updateCosts(session2.id, 2200, 1200, 5);
    
    // Show active sessions
    const activeSessions = sessionManager.getActiveSessions();
    console.log(`\n🔄 Active sessions: ${activeSessions.length}`);
    
    activeSessions.forEach(session => {
      const summary = sessionManager.getSessionSummary(session.id);
      if (summary) {
        console.log(`   ${summary.projectName}: ${summary.currentPhase} ($${summary.cost.toFixed(4)})`);
      }
    });
    
    // Close one session
    sessionManager.closeSession(session1.id);
    console.log(`\n🔒 Closed session: ${session1.id}`);
    
    // Show final state
    const finalActive = sessionManager.getActiveSessions();
    console.log(`🔄 Remaining active sessions: ${finalActive.length}`);
    
  } catch (error) {
    console.error('💥 Session management demo failed:', error);
  }
}

async function demoResilience() {
  console.log('\n🛡️ Demo: Resilience & Retry Logic\n');
  
  try {
    // Test retry with a function that fails initially
    let attemptCount = 0;
    const flakyFunction = async () => {
      attemptCount++;
      if (attemptCount < 3) {
        throw new Error('Temporary failure - retry me!');
      }
      return 'Success after retries!';
    };
    
    console.log('🔄 Testing retry logic...');
    const retryResult = await withSmartRetry(flakyFunction, { maxRetries: 3 });
    
    if (retryResult.success) {
      console.log(`✅ Retry succeeded: ${retryResult.result}`);
      console.log(`🔄 Attempts: ${retryResult.attempts}`);
      console.log(`⏱️  Total delay: ${retryResult.totalDelayMs}ms`);
    } else {
      console.log('❌ Retry failed');
    }
    
  } catch (error) {
    console.error('💥 Resilience demo failed:', error);
  }
}

async function main() {
  console.log('🚀 LetAIThink - Enhanced Agent Demo\n');
  console.log('This demo showcases:');
  console.log('  • Handoff-based agent coordination');
  console.log('  • Session management and persistence');
  console.log('  • Cost tracking and budget management');
  console.log('  • Resilience and retry logic');
  console.log('  • Multi-turn conversation support\n');
  
  await demoHandoffPipeline();
  await demoSessionManagement();
  await demoResilience();
  
  console.log('\n�� Demo completed!');
  console.log('\n💡 Key improvements implemented:');
  console.log('   ✅ Agents SDK handoffs enabled');
  console.log('   ✅ Built-in memory and coordination');
  console.log('   ✅ Session management for multi-turn conversations');
  console.log('   ✅ Cost tracking and budget enforcement');
  console.log('   ✅ Resilience with retry logic and circuit breakers');
  console.log('   ✅ Enhanced observability and state persistence');
}

main().catch(err => {
  console.error('💥 Demo failed:', err);
  process.exit(1);
});
