const url = new URL(window.location);
document.querySelector('#app').textContent = `Route: ${url.pathname}`;
