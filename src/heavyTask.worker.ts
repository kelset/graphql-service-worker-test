/// <reference lib="webworker" />

self.onmessage = (event: MessageEvent<{ count: number }>) => {
  const { count } = event.data
  let sum = 0
  for (let i = 1; i <= count; i++) {
    sum += i
  }
  // Post the result back to the main thread
  self.postMessage(sum)
}
