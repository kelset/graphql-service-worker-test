/// <reference lib="webworker" />

import { storeData } from './db'

import { ApolloClient, InMemoryCache, gql } from '@apollo/client/core'
import { createHttpLink } from '@apollo/client/link/http'

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

const endpoint = 'https://beta.pokeapi.co/graphql/v1beta'

const client = new ApolloClient({
  link: createHttpLink({ uri: endpoint, fetch }),
  cache: new InMemoryCache(),
})

const query = gql`
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

self.onmessage = async () => {
  console.log('Worker: received fetch command')
  console.log('Worker: fetching data...')
  try {
    const { data } = await client.query<QueryResult>({
      query,
    })
    const key = `pokemon-${Date.now()}`
    console.log('Worker: storing fetched data with key', key)
    await storeData(key, data)
    console.log('Worker: posting cache key to main thread')
    self.postMessage({ key })
  } catch (err) {
    console.error('Worker: error fetching data', err)
    self.postMessage({ error: (err as Error).message })
  }
}

