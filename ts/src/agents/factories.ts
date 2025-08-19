import Arcade from '@arcadeai/arcadejs'
import { executeOrAuthorizeZodTool, toZod } from '@arcadeai/arcadejs/lib'
import { Agent, tool } from '@openai/agents'
import type { Role } from '../ontologies/toolPolicies'
import { examplePolicies } from '../ontologies/toolPolicies'
import { makeApprovalExecuteFactory } from '../policies/approval'

type CreateAgentOptions = {
  client: Arcade
  role: Role
  name: string
  instructions: string
  model: string
  userId: string
}

const roleToToolkit: Record<Role, string[]> = {
  orchestrator: [],
  researcher: ['google'],
  architect: [],
  coder: ['github'],
  qa: ['github'],
  publisher: ['vercel', 'render', 'fly'],
  marketer: ['google', 'slack'],
}

export async function createAgentWithRole(opts: CreateAgentOptions): Promise<Agent> {
  const { client, role, name, instructions, model, userId } = opts
  const toolkits = roleToToolkit[role]

  const toolsFns: ReturnType<typeof tool>[] = []
  const executeFactory = makeApprovalExecuteFactory(examplePolicies, role, () => false)
  for (const tk of toolkits) {
    const list = await client.tools.list({ toolkit: tk, limit: 50 })
    const z = toZod({ tools: list.items, client, userId, executeFactory })
    toolsFns.push(...z.map(tool))
  }

  // Create agent with role-specific configuration
  const agent = new Agent({ 
    name, 
    instructions, 
    model, 
    tools: toolsFns
  })

  // Store role and userId in agent metadata for handoff coordination
  ;(agent as any).role = role
  ;(agent as any).userId = userId

  return agent
}


