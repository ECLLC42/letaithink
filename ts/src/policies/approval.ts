import { executeOrAuthorizeZodTool } from '@arcadeai/arcadejs/lib'
import type { Role, ToolPolicies } from '../ontologies/toolPolicies'

type ToolDef = { name?: string }

function matchesAction(toolName: string, action: 'delete' | 'rollback' | 'revoke' | 'external_post'): boolean {
  const n = toolName.toLowerCase()
  switch (action) {
    case 'delete': return n.includes('delete') || n.includes('remove')
    case 'rollback': return n.includes('rollback') || n.includes('revert')
    case 'revoke': return n.includes('revoke') || n.includes('disconnect')
    case 'external_post': return n.includes('post') || n.includes('publish') || n.includes('send')
  }
}

export function makeApprovalExecuteFactory(policies: ToolPolicies, role: Role, isApproved: (tool: ToolDef) => boolean) {
  const gated = new Set(policies.roles[role].approvalRequiredActions)
  return (params: any) => {
    const { zodToolSchema, toolDefinition, client, userId } = params as { zodToolSchema: unknown; toolDefinition: ToolDef; client: any; userId: string }
    const delegate = executeOrAuthorizeZodTool({ zodToolSchema: zodToolSchema as any, toolDefinition: toolDefinition as any, client, userId } as any)
    // Return the actual executor that will receive args at call time
    return async (args: unknown) => {
      const name = toolDefinition?.name ?? 'unknown'
      for (const action of gated) {
        if (matchesAction(name, action) && !isApproved(toolDefinition)) {
          throw new Error(`Approval required for action '${action}' on tool '${name}'. Request approval before retrying.`)
        }
      }
      return (delegate as (a: unknown) => Promise<unknown>)(args)
    }
  }
}


