export interface CostTracker {
  sessionId: string
  model: string
  inputTokens: number
  outputTokens: number
  toolCalls: number
  estimatedCost: number
}

export interface CostLimits {
  maxTokensPerSession: number
  maxCostPerSession: number
  maxToolCallsPerSession: number
}

export const DEFAULT_COST_LIMITS: CostLimits = {
  maxTokensPerSession: 100000, // 100k tokens
  maxCostPerSession: 0.50, // $0.50 USD
  maxToolCallsPerSession: 100
}

// OpenAI pricing (approximate per 1K tokens)
const MODEL_RATES: Record<string, { input: number; output: number }> = {
  'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
  'gpt-4o': { input: 0.005, output: 0.015 },
  'gpt-4-turbo': { input: 0.01, output: 0.03 },
  'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 }
}

export function calculateCost(tracker: CostTracker): number {
  const rate = MODEL_RATES[tracker.model] || MODEL_RATES['gpt-4o-mini']
  return (tracker.inputTokens * rate.input + tracker.outputTokens * rate.output) / 1000
}

export function checkCostLimits(
  tracker: CostTracker, 
  limits: CostLimits = DEFAULT_COST_LIMITS
): { ok: boolean; violations: string[] } {
  const violations: string[] = []
  
  if (tracker.inputTokens + tracker.outputTokens > limits.maxTokensPerSession) {
    violations.push(`Token limit exceeded: ${tracker.inputTokens + tracker.outputTokens}/${limits.maxTokensPerSession}`)
  }
  
  if (tracker.estimatedCost > limits.maxCostPerSession) {
    violations.push(`Cost limit exceeded: $${tracker.estimatedCost.toFixed(4)}/${limits.maxCostPerSession}`)
  }
  
  if (tracker.toolCalls > limits.maxToolCallsPerSession) {
    violations.push(`Tool call limit exceeded: ${tracker.toolCalls}/${limits.maxToolCallsPerSession}`)
  }
  
  return { ok: violations.length === 0, violations }
}

export function createCostTracker(
  sessionId: string, 
  model: string
): CostTracker {
  return {
    sessionId,
    model,
    inputTokens: 0,
    outputTokens: 0,
    toolCalls: 0,
    estimatedCost: 0
  }
}

export function updateCostTracker(
  tracker: CostTracker,
  inputTokens: number = 0,
  outputTokens: number = 0,
  toolCalls: number = 0
): CostTracker {
  const updated = {
    ...tracker,
    inputTokens: tracker.inputTokens + inputTokens,
    outputTokens: tracker.outputTokens + outputTokens,
    toolCalls: tracker.toolCalls + toolCalls
  }
  
  updated.estimatedCost = calculateCost(updated)
  return updated
}
