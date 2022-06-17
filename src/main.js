import './components/currency-card.js'
import currencyProxy from './store.js'
import fetchRates from './fetchRates.js'

let inputTimeout
const updateRates = async (bounce = 1000) => {
  const { srcSymbol, dstSymbol, srcAmount } = currencyProxy

  clearTimeout(inputTimeout)

  inputTimeout = setTimeout(async () => {
    const { rates } = await fetchRates(srcSymbol, dstSymbol, srcAmount)
    currencyProxy.dstAmount = (rates[dstSymbol] * srcAmount).toFixed(2)
    window.vibrate()
    window.dispatchEvent(new CustomEvent('converted', { detail: { currencyProxy } }))
  }, bounce)
}

window.onload = () => {
  updateRates()

  // Setting Dark Mode based on System Preference
  window.matchMedia('(prefers-color-scheme: dark)').matches
    ? document.body.classList.add('dark-mode')
    : document.body.classList.remove('dark-mode')
}

window.addEventListener('fetch', (event) => {
  const { bounceRate } = event.detail
  updateRates(bounceRate)
})
