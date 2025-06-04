/// <reference lib="webworker" />

import { request } from 'graffle'

const endpoint = 'https://beta.pokeapi.co/graphql/v1beta'

self.addEventListener('message', (event: any) => {
  const data = event.data
  console.log('[sw] message received', data)
  if (!data || data.type !== 'GRAPHQL_FETCH') return
  event.waitUntil(handleGraphQL(event))
})

async function handleGraphQL(event: ExtendableMessageEvent) {
  const { query, variables } = event.data
  console.log('[sw] handleGraphQL', { query, variables })
  try {
    const result = await request(endpoint, query, variables)
    console.log('[sw] GraphQL result', result)
    event.source?.postMessage({ type: 'GRAPHQL_RESPONSE', payload: result })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[sw] GraphQL error', message)
    event.source?.postMessage({ type: 'GRAPHQL_ERROR', payload: message })
  }
}
