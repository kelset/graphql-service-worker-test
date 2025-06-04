const worker = new Worker(new URL('./heavyTask.worker.ts', import.meta.url), {
  type: 'module',
})

export function setupHeavyTask(button: HTMLButtonElement, output: HTMLElement) {
  button.textContent = 'Compute sum'

  // Listen for results from the worker
  worker.addEventListener('message', (event: MessageEvent<number>) => {
    output.textContent = `sum is ${event.data}`
    console.timeEnd('heavyTask')
  })

  button.addEventListener('click', () => {
    console.time('heavyTask')
    worker.postMessage({ count: 100000000 })
  })
}
