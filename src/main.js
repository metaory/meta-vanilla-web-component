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
  }, bounce)
}

updateRates()

window.addEventListener('fetch', (event) => {
  const { bounceRate } = event.detail
  updateRates(bounceRate)
})

// setInterval(() => window.location.reload(), 10000)
