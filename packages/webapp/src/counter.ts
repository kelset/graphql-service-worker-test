export function setupCounter(button: HTMLButtonElement, output: HTMLElement) {
  let counter = 0
  const setCounter = (count: number) => {
    counter = count
    output.textContent = `count is ${counter}`
  }
  button.addEventListener('click', () => {
    console.time('counter')
    setCounter(counter + 1)
    console.timeEnd('counter')
  })
  setCounter(0)
}
