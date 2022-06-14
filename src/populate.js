/* THIS FILE IS NO LONGER USED */
/* Deprecated in favor of loader.js */
const loadContent = (path, selector) => fetch(path)
  .then(response => {
    return response.text()
  })
  .then(data => { document.querySelector(selector).innerHTML = data })

export default async function() {
  console.log('POP DEF')
  await Promise.all([
    loadContent('./src/tpl/header.html', 'header'),
    loadContent('./src/tpl/currency.html', 'currency-src'),
    loadContent('./src/tpl/currency.html', 'currency-dst'),
    loadContent('./src/tpl/switch.html', 'currency-switch'),
    loadContent('./src/tpl/alert.html', 'alert')
  ])
  Array.from(document.querySelectorAll('section.currency')).forEach((x, i) => {
    if (i === 0) x.setAttribute('id', 'currency-src')
    if (i === 1) x.setAttribute('id', 'currency-dst')
  })
  document.querySelector('currency-dst select').value = 'EUR'
  document.querySelector('currency-dst input').classList.add('disabled');
}
