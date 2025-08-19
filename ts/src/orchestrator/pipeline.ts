import Arcade from '@arcadeai/arcadejs'
import { run } from '@openai/agents'
import { buildAgents } from '../agents/roles'
import { scanForPII } from '../guardrails/pii'
import { store } from '../state/store'
import { Project, Session, Run } from '../state/models'

export interface PipelineResult {
  status: 'completed' | 'blocked' | 'failed'
  phase: string
  outputs: Record<string, any>
  nextSteps: string[]
  sessionId: string
}

export async function runPipelineWithHandoffs(
  client: Arcade, 
  userId: string, 
  projectName: string = 'runner-habits'
): Promise<PipelineResult> {
  const agents = await buildAgents(client, userId)
  
  // Create project and session
  const projectId = `project-${Date.now()}`
  const sessionId = `session-${projectId}`
  
  const project: Project = {
    id: projectId,
    name: projectName,
    environments: ['staging', 'production']
  }
  
  const session: Session = {
    id: sessionId,
    projectId,
    transcript: [],
    budgetTokens: 100000 // 100k token budget
  }
  
  store.upsertProject(project)
  store.upsertSession(session)
  
  try {
    // Start with orchestrator that coordinates the entire process
    const orchestratorResult = await run(
      agents.orchestrator, 
      `Coordinate the complete MVP build for project "${projectName}". 
       
       Project Requirements:
       - Build a runner habit tracking app
       - Next.js frontend with TypeScript
       - FastAPI backend with PostgreSQL
       - CI/CD pipeline with testing
       - Deploy to staging and production
       
       Coordinate all phases using handoffs to specialized agents:
       1. Research market and competitors
       2. Design system architecture
       3. Implement and scaffold repository
       4. Run QA and testing
       5. Deploy to environments
       6. Create marketing content
       
       Ensure proper gates: QA must pass before deployment, deployment must succeed before marketing.
       Monitor progress and provide status updates.`
    )
    
    // Store the run
    const runRecord: Run = {
      id: `run-${Date.now()}`,
      agent: 'orchestrator',
      status: 'succeeded',
      costTokens: 0, // Would calculate from actual usage
      traceId: sessionId,
      toolCalls: []
    }
    store.upsertRun(runRecord)
    
    // Parse the result to extract key information
    const output = orchestratorResult.finalOutput || ''
    const sessionTranscript = session.transcript
    sessionTranscript.push(`Orchestrator: ${output}`)
    store.upsertSession(session)
    
    // Check for any blocking issues
    if (output.includes('blocked') || output.includes('failed')) {
      return {
        status: 'blocked',
        phase: 'orchestration',
        outputs: { orchestrator: output },
        nextSteps: ['Resolve blocking issues', 'Retry orchestration'],
        sessionId
      }
    }
    
    // Check for PII in outputs
    const piiScan = scanForPII(output)
    if (!piiScan.ok) {
      return {
        status: 'blocked',
        phase: 'safety',
        outputs: { orchestrator: output, pii: piiScan },
        nextSteps: ['Remove PII from outputs', 'Retry orchestration'],
        sessionId
      }
    }
    
    return {
      status: 'completed',
      phase: 'orchestration',
      outputs: { 
        orchestrator: output,
        project: project,
        session: session
      },
      nextSteps: [
        'Monitor agent handoffs',
        'Review phase progress',
        'Address any approval requests'
      ],
      sessionId
    }
    
  } catch (error) {
    // Store failed run
    const runRecord: Run = {
      id: `run-${Date.now()}`,
      agent: 'orchestrator',
      status: 'failed',
      costTokens: 0,
      traceId: sessionId,
      toolCalls: []
    }
    store.upsertRun(runRecord)
    
    return {
      status: 'failed',
      phase: 'orchestration',
      outputs: { error: error instanceof Error ? error.message : String(error) },
      nextSteps: ['Review error logs', 'Check agent configuration', 'Retry pipeline'],
      sessionId
    }
  }
}

// Legacy sequential pipeline for comparison/testing
export async function runPipeline(client: Arcade, userId: string) {
  const agents = await buildAgents(client, userId)

  // Intake → Research (parallel) → Architecture → Build (PRs) → QA (gate) → Deploy (gate) → Marketing → Summary
  const researchInput = 'Perform competitor scan for similar runner habit trackers.'
  const research = await run(agents.researcher, researchInput)

  const archInput = 'Propose stack and data model for Next.js + FastAPI mono-repo with CI.'
  const arch = await run(agents.architect, archInput)

  const buildInput = "Create repo 'runner-habits' with Next.js (App Router TS) + FastAPI skeleton, open PR, add CI."
  const buildRes = await run(agents.coder, buildInput)

  const qaInput = 'Trigger E2E/CI and summarize results.'
  const qaRes = await run(agents.qa, qaInput)
  if (!/passed|green|success/i.test(qaRes.finalOutput ?? '')) {
    return { gate: 'QA', status: 'blocked', details: qaRes.finalOutput }
  }

  const deployInput = 'Deploy to staging, set env vars, run health checks; rollback if failing.'
  const deployRes = await run(agents.publisher, deployInput)
  if (/rollback_needed\":\s*true/i.test(deployRes.finalOutput ?? '')) {
    return { gate: 'Deploy', status: 'blocked', details: deployRes.finalOutput }
  }

  const marketerInput = 'Draft a launch blurb and email; ensure no PII leaks.'
  const marketerRes = await run(agents.marketer, marketerInput)
  const pii = scanForPII(marketerRes.finalOutput ?? '')
  if (!pii.ok) {
    return { gate: 'Safety', status: 'blocked', details: pii }
  }

  return {
    gate: 'Summary',
    status: 'ok',
    outputs: {
      research: research.finalOutput,
      architecture: arch.finalOutput,
      build: buildRes.finalOutput,
      qa: qaRes.finalOutput,
      deploy: deployRes.finalOutput,
      marketing: marketerRes.finalOutput,
    },
  }
}



