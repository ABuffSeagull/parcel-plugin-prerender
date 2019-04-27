fetch('//httpbin.org/json')
  .then(res => res.json())
  .then(json => {
    for (const key of ['author', 'date', 'title']) {
      document.querySelector(`#${key}`).textContent = json.slideshow[key];
    }
    document.dispatchEvent(new Event('prerender-trigger'));
  });
