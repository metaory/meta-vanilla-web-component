import './components/currency-card.js'
import currencyProxy from './store.js'
import fetchRates from './fetchRates.js'

let inputTimeout
const updateRates = async (bounce = 1000) => {
  const { srcSymbol, dstSymbol, srcAmount } = currencyProxy

  clearTimeout(inputTimeout)

  inputTimeout = setTimeout(async () => {
    const { rates } = await fetchRates(srcSymbol, dstSymbol, srcAmount)
    currencyProxy.rates = rates[dstSymbol]
  }, bounce)
}

// Populate app version
fetch('./src/components/version.html')
  .then(response => response.text())
  .then(data => { document.querySelector('app-version').innerHTML = data })

// Setting Dark Mode based on System Preference
window.matchMedia('(prefers-color-scheme: dark)').matches
  ? document.body.classList.add('dark-mode')
  : document.body.classList.remove('dark-mode')

// Initial load
window.onload = () => updateRates()

// Update fetch event
window.addEventListener('fetch', ({ detail }) => updateRates(detail))

// Global mobile safe vibrate
window.vibrate = (ms = 300) => 'ontouchstart' in document.documentElement &&
  window.navigator.vibrate(ms)

// Global currency symbols
window.SYMBOLS = { USD: '$', EUR: '&euro;', JPY: '&yen;' }
