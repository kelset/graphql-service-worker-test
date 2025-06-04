import './style.css'
import { setupCounter } from './counter.ts'
import { setupHeavyTask } from './heavyTask.ts'
import { setupFetchPokemons } from './fetchPokemons.ts'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <h1>GraphQL Service Worker Test</h1>
  <div class="control">
    <button id="counter" type="button">Increment</button>
    <span id="counter-result"></span>
  </div>
  <div class="control">
    <button id="heavy" type="button">Compute sum</button>
    <span id="heavy-result"></span>
  </div>
  <div class="control">
    <button id="fetch" type="button">Fetch Pokemon</button>
    <span id="fetch-result"></span>
  </div>
  <div id="carousel" style="display:none;">
    <button id="prev" type="button">&#9664;</button>
    <span id="carousel-content"></span>
    <button id="next" type="button">&#9654;</button>
  </div>
`

setupCounter(
  document.querySelector<HTMLButtonElement>('#counter')!,
  document.querySelector<HTMLSpanElement>('#counter-result')!
)
setupHeavyTask(
  document.querySelector<HTMLButtonElement>('#heavy')!,
  document.querySelector<HTMLSpanElement>('#heavy-result')!
)
const fetchButton = document.querySelector<HTMLButtonElement>('#fetch')!
fetchButton.disabled = true

setupFetchPokemons(
  fetchButton,
  document.querySelector<HTMLSpanElement>('#fetch-result')!,
  document.querySelector<HTMLDivElement>('#carousel')!
)

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/sw.js')
    .then(() => {
      console.log('Service Worker registered')
      return navigator.serviceWorker.ready
    })
    .then(() => {
      console.log('Service Worker ready')
      fetchButton.disabled = false
    })
    .catch((err) => {
      console.error('Service Worker registration failed:', err)
      fetchButton.disabled = false
    })
} else {
  fetchButton.disabled = false
}
