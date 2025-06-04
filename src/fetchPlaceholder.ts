export function setupFetchPlaceholder(element: HTMLButtonElement) {
  element.innerHTML = 'Fetch data (TODO)';
  element.addEventListener('click', () => {
    element.innerHTML = 'Fetching... (not implemented)';
  });
}
