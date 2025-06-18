import { readData } from './db'

const worker = new Worker(new URL('./fetchPokemons.worker.ts', import.meta.url), {
  type: 'module',
})

interface Species {
  name: string
  id: number
}

interface Generation {
  name: string
  pokemon_species: { aggregate: { count: number } }
}

interface QueryResult {
  gen3_species: Species[]
  generations: Generation[]
  [key: string]: unknown
}

export function setupFetchPokemons(
  button: HTMLButtonElement,
  output: HTMLElement,
  carousel: HTMLDivElement
) {
  const prev = carousel.querySelector<HTMLButtonElement>('#prev')!
  const next = carousel.querySelector<HTMLButtonElement>('#next')!
  const content = carousel.querySelector<HTMLSpanElement>('#carousel-content')!

  button.textContent = 'Fetch Pokemon'

  let species: Species[] = []
  let total = 0
  let index = 0

  const render = () => {
    if (!species.length) return
    const s = species[index]
    content.textContent = `${s.name} (#${s.id})`
    if (index === Math.min(species.length, 10) - 1 && total > 10) {
      content.textContent += ` ...and ${total - 10} more`
    }
  }

  prev.addEventListener('click', () => {
    if (!species.length) return
    const max = Math.min(species.length, 10)
    index = (index - 1 + max) % max
    render()
  })

  next.addEventListener('click', () => {
    if (!species.length) return
    const max = Math.min(species.length, 10)
    index = (index + 1) % max
    render()
  })

  worker.addEventListener(
    'message',
    async (event: MessageEvent<{ key?: string; error?: string }>) => {
      console.log('Main thread: received message from worker', event.data)
      const { key, error } = event.data
      if (error || !key) {
        output.textContent = 'Error fetching data'
        console.error(error)
        console.timeEnd('fetchPokemons')
        return
      }
      console.log('Main thread: reading data from DB with key', key)
      const data = await readData<QueryResult>(key)
      if (!data) {
        output.textContent = 'Error reading stored data'
        console.error('Main thread: data not found')
        console.timeEnd('fetchPokemons')
        return
      }
      console.log('Main thread: data read from DB')
      console.timeEnd('fetchPokemons')
      species = data.gen3_species
      total = species.length
      output.textContent = `Fetched ${total} pokemon`
      if (species.length) {
        index = 0
        carousel.style.display = 'flex'
        render()
      }
    }
  )

  button.addEventListener('click', () => {
    console.time('fetchPokemons')
    output.textContent = 'Fetching...'
    console.log('Main thread: sending fetch command to worker')
    worker.postMessage('fetch')
  })
}
