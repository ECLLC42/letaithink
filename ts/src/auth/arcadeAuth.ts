import Arcade from '@arcadeai/arcadejs'

export async function requiresAuth(client: Arcade, toolName: string, userId: string): Promise<{ needsAuth: boolean; id?: string; authUrl?: string }> {
  const resp = await client.tools.authorize({ tool_name: toolName, user_id: userId })
  return {
    needsAuth: resp.status === 'pending',
    id: resp.id ?? undefined,
    authUrl: resp.url ?? undefined,
  }
}

export async function waitForAuthorization(client: Arcade, id: string): Promise<void> {
  const response = await client.auth.waitForCompletion(id)
  if (response.status !== 'completed') {
    throw new Error('Authorization failed')
  }
}



