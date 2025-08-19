export type Role = 'orchestrator' | 'researcher' | 'architect' | 'coder' | 'qa' | 'publisher' | 'marketer'

export type ToolPolicy = {
  toolkits: string[]
  approvalRequiredActions: Array<'delete' | 'rollback' | 'revoke' | 'external_post'>
}

export type ToolPolicies = {
  roles: Record<Role, ToolPolicy>
}

export const examplePolicies: ToolPolicies = {
  roles: {
    orchestrator: { toolkits: [], approvalRequiredActions: ['delete', 'rollback', 'revoke', 'external_post'] },
    researcher: { toolkits: ['google'], approvalRequiredActions: [] },
    architect: { toolkits: [], approvalRequiredActions: [] },
    coder: { toolkits: ['github'], approvalRequiredActions: ['delete', 'revoke'] },
    qa: { toolkits: ['github'], approvalRequiredActions: [] },
    publisher: { toolkits: ['vercel', 'render', 'fly'], approvalRequiredActions: ['rollback', 'delete'] },
    marketer: { toolkits: ['google', 'slack'], approvalRequiredActions: ['external_post'] },
  },
}


