export interface RetryConfig {
  maxRetries: number
  baseDelayMs: number
  maxDelayMs: number
  backoffMultiplier: number
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2
}

export interface RetryResult<T> {
  success: boolean
  result?: T
  error?: Error
  attempts: number
  totalDelayMs: number
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<RetryResult<T>> {
  const finalConfig = { ...DEFAULT_RETRY_CONFIG, ...config }
  let lastError: Error
  let totalDelayMs = 0
  
  for (let attempt = 1; attempt <= finalConfig.maxRetries; attempt++) {
    try {
      const result = await fn()
      return {
        success: true,
        result,
        attempts: attempt,
        totalDelayMs
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      
      if (attempt === finalConfig.maxRetries) {
        return {
          success: false,
          error: lastError,
          attempts: attempt,
          totalDelayMs
        }
      }
      
      // Calculate delay with exponential backoff
      const delay = Math.min(
        finalConfig.baseDelayMs * Math.pow(finalConfig.backoffMultiplier, attempt - 1),
        finalConfig.maxDelayMs
      )
      
      totalDelayMs += delay
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  return {
    success: false,
    error: lastError!,
    attempts: finalConfig.maxRetries,
    totalDelayMs
  }
}

export function isRetryableError(error: Error): boolean {
  const retryablePatterns = [
    /rate limit/i,
    /timeout/i,
    /network/i,
    /temporary/i,
    /unavailable/i,
    /too many requests/i,
    /quota exceeded/i
  ]
  
  return retryablePatterns.some(pattern => pattern.test(error.message))
}

export async function withSmartRetry<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<RetryResult<T>> {
  const finalConfig = { ...DEFAULT_RETRY_CONFIG, ...config }
  
  return withRetry(async () => {
    try {
      return await fn()
    } catch (error) {
      if (error instanceof Error && !isRetryableError(error)) {
        // Don't retry non-retryable errors
        throw error
      }
      throw error
    }
  }, finalConfig)
}

export function createCircuitBreaker(
  failureThreshold: number = 5,
  resetTimeoutMs: number = 60000
) {
  let failureCount = 0
  let lastFailureTime = 0
  let state: 'closed' | 'open' | 'half-open' = 'closed'
  
  return {
    async execute<T>(fn: () => Promise<T>): Promise<T> {
      if (state === 'open') {
        if (Date.now() - lastFailureTime > resetTimeoutMs) {
          state = 'half-open'
        } else {
          throw new Error('Circuit breaker is open')
        }
      }
      
      try {
        const result = await fn()
        if (state === 'half-open') {
          state = 'closed'
          failureCount = 0
        }
        return result
      } catch (error) {
        failureCount++
        lastFailureTime = Date.now()
        
        if (failureCount >= failureThreshold) {
          state = 'open'
        }
        
        throw error
      }
    },
    
    getState() {
      return state
    },
    
    getFailureCount() {
      return failureCount
    }
  }
}
