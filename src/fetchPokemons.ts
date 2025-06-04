import { gql, request } from 'graffle'

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
}

const endpoint = 'https://beta.pokeapi.co/graphql/v1beta'

const query = gql`
  query samplePokeAPIquery {
    gen3_species: pokemon_v2_pokemonspecies(
      where: { pokemon_v2_generation: { name: { _eq: "generation-iii" } } }
      order_by: { id: asc }
    ) {
      name
      id
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

  button.addEventListener('click', async () => {
    console.time('fetchPokemons')
    output.textContent = 'Fetching...'
    try {
      const data = await request<QueryResult>({
        url: endpoint,
        document: query,
      })
      console.timeEnd('fetchPokemons')
      species = data.gen3_species
      total = species.length
      output.textContent = `Fetched ${total} pokemon`
      if (species.length) {
        index = 0
        carousel.style.display = 'flex'
        render()
      }
    } catch (err) {
      output.textContent = 'Error fetching data'
      console.error(err)
      console.timeEnd('fetchPokemons')
    }
  })
}
