/// <reference lib="webworker" />

async function request(endpoint, query, variables) {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  })
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`)
  }
  const json = await res.json()
  if (json.errors) {
    const message = json.errors[0]?.message || 'GraphQL error'
    throw new Error(message)
  }
  return json.data
}

const endpoint = 'https://beta.pokeapi.co/graphql/v1beta'

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('message', (event) => {
  const data = event.data
  console.log('[sw] message received', data)
  if (!data || data.type !== 'GRAPHQL_FETCH') return
  event.waitUntil(handleGraphQL(event))
})

async function handleGraphQL(event) {
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
