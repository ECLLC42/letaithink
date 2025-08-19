export type Project = {
  id: string
  name: string
  repoUrl?: string
  environments?: string[]
}

export type Session = {
  id: string
  projectId: string
  transcript: string[]
  budgetTokens?: number
}

export type Run = {
  id: string
  agent: string
  status: 'pending' | 'running' | 'succeeded' | 'failed'
  costTokens?: number
  traceId?: string
  toolCalls: Array<{ tool: string; input: unknown; output?: unknown; error?: string }>
}

export type Artifact = {
  id: string
  type: 'code' | 'doc' | 'report'
  ref: string // storage reference
}

export type Handoff = {
  id: string
  from: string
  to: string
  reason: string
  payload?: unknown
}

export type Tool = {
  name: string
  scopes: string[]
  audit: Array<{ at: string; event: string; meta?: unknown }>
}


