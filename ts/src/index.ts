import 'dotenv/config';
import Arcade from '@arcadeai/arcadejs';
import { run } from '@openai/agents';
import { createAgentWithRole } from './agents/factories';
import { runPipelineWithHandoffs, runPipeline } from './orchestrator/pipeline';
import { examplePolicies } from './ontologies/toolPolicies';

async function main() {
  const client = new Arcade({ apiKey: process.env.ARCADE_API_KEY! });
  
  console.log('🚀 Starting LetAIThink - Idea-to-Prototype Lab\n');
  
  // Option 1: Run the new handoff-based pipeline (recommended)
  console.log('📋 Running handoff-based pipeline...');
  try {
    const handoffResult = await runPipelineWithHandoffs(client, 'user-123', 'runner-habits');
    console.log('✅ Handoff Pipeline Result:', {
      status: handoffResult.status,
      phase: handoffResult.phase,
      sessionId: handoffResult.sessionId,
      nextSteps: handoffResult.nextSteps
    });
    
    if (handoffResult.outputs.orchestrator) {
      console.log('\n🎯 Orchestrator Output Preview:');
      const output = handoffResult.outputs.orchestrator as string;
      console.log(output.substring(0, 500) + (output.length > 500 ? '...' : ''));
    }
    
  } catch (error) {
    console.error('❌ Handoff pipeline failed:', error);
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
  
  // Option 2: Run individual agent demo (legacy approach)
  console.log('🔧 Running individual agent demo...');
  try {
    const coder = await createAgentWithRole({
      client,
      role: 'coder',
      name: 'Coder',
      instructions: `
Role: Senior Coder Agent.
Goal: Scaffold a new repository 'runner-habits' with a Next.js (App Router, TypeScript) frontend and FastAPI backend, seed CI, and open a PR.

Policies & constraints:
- Use only your granted tools (GitHub toolkit); operate with least privilege.
- Make all code changes via branches and PRs; do not force-push to default.
- Destructive actions (delete, revoke, rollback) require explicit approval. If needed, stop and ask.
- If a tool requires consent, surface the authorization link and pause.
- Keep outputs concise and action-focused; no internal chain-of-thought.

Process:
1) Produce a short, bulleted plan for the task.
2) Execute the plan using tools, opening a branch and PR.
3) Set up CI (e.g., GitHub Actions) for build/test.
4) Validate that CI has triggered successfully.

Return structured output as JSON in a fenced block with keys: plan, repo_url, pr_url, ci_status, changes_summary, next_steps.
      `,
      model: 'gpt-4o-mini',
      userId: 'user-123',
    });
    
    const result = await run(coder, "Create repo 'runner-habits' and open a PR.");
    console.log('✅ Coder Agent Result:', result.finalOutput);
    
  } catch (error) {
    console.error('❌ Individual agent demo failed:', error);
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
  
  // Option 3: Run legacy sequential pipeline for comparison
  console.log('🔄 Running legacy sequential pipeline...');
  try {
    const pipelineResult = await runPipeline(client, 'user-123');
    console.log('✅ Legacy Pipeline Result:', pipelineResult);
  } catch (error) {
    console.error('❌ Legacy pipeline failed:', error);
  }
  
  console.log('\n🎉 Demo completed! Check the results above to see the different approaches.');
  console.log('\n💡 Next steps:');
  console.log('   - The handoff-based pipeline enables better agent coordination');
  console.log('   - Individual agents can still be used for focused tasks');
  console.log('   - Sessions and state are now persisted for better continuity');
  console.log('   - Built-in memory and tracing provide better observability');
}

main().catch(err => { 
  console.error('💥 Fatal error:', err); 
  process.exit(1); 
});
