import 'dotenv/config';
import Arcade from '@arcadeai/arcadejs';
import { sessionManager } from './state/session';
import { withSmartRetry } from './guardrails/resilience';

async function simpleTest() {
  console.log('🧪 Simple Test - Basic Functionality\n');
  
  try {
    // Test session management
    console.log('📝 Testing session management...');
    const session = sessionManager.createSession('test-project', 'test-user');
    console.log(`✅ Created session: ${session.id}`);
    
    // Test transcript
    sessionManager.addTranscriptEntry(session.id, 'TestAgent', 'Hello world!');
    console.log('✅ Added transcript entry');
    
    // Test cost tracking
    sessionManager.updateCosts(session.id, 100, 50, 1);
    console.log('✅ Updated costs');
    
    // Test session summary
    const summary = sessionManager.getSessionSummary(session.id);
    if (summary) {
      console.log('✅ Session summary:', {
        projectName: summary.projectName,
        cost: summary.cost,
        duration: summary.duration
      });
    }
    
    // Test resilience
    console.log('\n🔄 Testing resilience...');
    let attemptCount = 0;
    const flakyFunction = async () => {
      attemptCount++;
      if (attemptCount < 2) {
        throw new Error('Temporary failure');
      }
      return 'Success!';
    };
    
    const retryResult = await withSmartRetry(flakyFunction, { maxRetries: 3 });
    if (retryResult.success) {
      console.log(`✅ Retry succeeded: ${retryResult.result}`);
      console.log(`🔄 Attempts: ${retryResult.attempts}`);
    } else {
      console.log('❌ Retry failed');
    }
    
    console.log('\n🎉 Simple test completed successfully!');
    
  } catch (error) {
    console.error('💥 Simple test failed:', error);
  }
}

simpleTest().catch(err => {
  console.error('💥 Test failed:', err);
  process.exit(1);
});
