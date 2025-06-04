import './style.css'
import { setupCounter } from './counter.ts'
import { setupHeavyTask } from './heavyTask.ts'
import { setupFetchPokemons } from './fetchPokemons.ts'

if ('serviceWorker' in navigator) {
  try {
    const registration = await navigator.serviceWorker.register(
      '/graphql-sw.js',
      {
        type: 'module',
      },
    )
    if (registration.installing) {
          console.log("Service worker installing");
        } else if (registration.waiting) {
          console.log("Service worker installed");
        } else if (registration.active) {
          console.log("Service worker active");
        }
    navigator.serviceWorker.ready.then((r) => {
      console.log('Service worker ready', r.active)
    })
  } catch (error) {
    console.error(`Registration failed with ${error}`);
  }
}

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
setupFetchPokemons(
  document.querySelector<HTMLButtonElement>('#fetch')!,
  document.querySelector<HTMLSpanElement>('#fetch-result')!,
  document.querySelector<HTMLDivElement>('#carousel')!
)
