export function setupHeavyTask(element: HTMLButtonElement) {
  element.innerHTML = 'Compute sum';
  element.addEventListener('click', () => {
    let sum = 0;
    for (let i = 1; i <= 1000000000; i++) {
      sum += i;
    }
    element.innerHTML = `sum is ${sum}`;
  });
}
