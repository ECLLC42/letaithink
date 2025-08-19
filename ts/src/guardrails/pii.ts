export type PiiScanResult = {
  ok: boolean
  findings?: Array<{ type: string; snippet: string }>
}

const EMAIL_REGEX = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i
const SECRET_HINT = /(api[_-]?key|secret|password|token)/i

export function scanForPII(text: string): PiiScanResult {
  const findings: PiiScanResult['findings'] = []
  const email = text.match(EMAIL_REGEX)
  if (email) findings?.push({ type: 'email', snippet: email[0] })
  if (SECRET_HINT.test(text)) findings?.push({ type: 'secret_hint', snippet: '...contains secret-like keyword...' })
  return { ok: findings.length === 0, findings }
}



