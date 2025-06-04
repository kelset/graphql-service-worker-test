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

export function setupFetchPokemons(element: HTMLButtonElement) {
  element.innerHTML = 'Fetch Pokemon'
  element.addEventListener('click', async () => {
    element.innerHTML = 'Fetching...'
    try {
      const data = await request<QueryResult>({
        url: endpoint,
        document: query,
      })
      element.innerHTML = `Fetched ${data.gen3_species.length} pokemon`
    } catch (err) {
      element.innerHTML = 'Error fetching data'
      console.error(err)
    }
  })
}
