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

const query = `
  query bigPokeAPIquery {
    gen3_species: pokemon_v2_pokemonspecies(
      where: { pokemon_v2_generation: { name: { _eq: "generation-iii" } } }
      order_by: { id: asc }
    ) {
      name
      id
      pokemon: pokemon_v2_pokemons(limit: 1) {
        height
        weight
        stats: pokemon_v2_pokemonstats {
          base_stat
          pokemon_v2_stat {
            name
          }
        }
        abilities: pokemon_v2_pokemonabilities(limit: 2) {
          pokemon_v2_ability {
            name
          }
        }
        moves: pokemon_v2_pokemonmoves(limit: 5) {
          pokemon_v2_move {
            name
          }
        }
      }
    }
    generations: pokemon_v2_generation {
      name
      pokemon_species: pokemon_v2_pokemonspecies_aggregate {
        aggregate {
          count
        }
      }
    }
  }
`

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

  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data.type === 'GRAPHQL_RESPONSE') {
      const data = event.data.payload as QueryResult
      console.log('[main] received response', data)
      console.timeEnd('fetchPokemons')
      species = data.gen3_species
      total = species.length
      output.textContent = `Fetched ${total} pokemon`
      if (species.length) {
        index = 0
        carousel.style.display = 'flex'
        render()
      }
    } else if (event.data.type === 'GRAPHQL_ERROR') {
      output.textContent = 'Error fetching data'
      console.error('[main] GraphQL error', event.data.payload)
      console.timeEnd('fetchPokemons')
    }
  })

  button.addEventListener('click', async () => {
    console.time('fetchPokemons')
    console.log('[main] sending query', { query })
    output.textContent = 'Fetching...'
    const registration = await navigator.serviceWorker.ready
    console.log('[main] service worker ready', registration.active)
    registration.active?.postMessage({
      type: 'GRAPHQL_FETCH',
      query,
      variables: {},
    })
  })
}
