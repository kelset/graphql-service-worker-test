export function setupHeavyTask(button: HTMLButtonElement, output: HTMLElement) {
  button.textContent = 'Compute sum';
  button.addEventListener('click', () => {
    console.time('heavyTask');
    let sum = 0;
    for (let i = 1; i <= 100000000; i++) {
      sum += i;
    }
    output.textContent = `sum is ${sum}`;
    console.timeEnd('heavyTask');
  });
}
