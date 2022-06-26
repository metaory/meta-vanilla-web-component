// Initial State
const currency = {
  srcSymbol: 'USD',
  srcAmount: 1,
  dstSymbol: 'EUR',
  dstAmount: 0,
  rates: 0
}

const handler = {
  get (target, property) {
    return target[property]
  },
  set (obj, prop, value) {
    obj[prop] = value
    console.debug('>>', 'Proxy updated', ':', prop, ':', value)
    if (prop === 'rates') {
      obj.dstAmount = (obj.rates * obj.srcAmount).toFixed(4)
      document.querySelector('history-component').render(obj)
      document.querySelector('currency-component[direction=dst]').render(obj)
      return true
    }
    if (prop.endsWith('Symbol')) {
      document.querySelector('currency-component[direction=src]').render(obj)
      document.querySelector('currency-component[direction=dst]').render(obj)
    }
    const bounceRate = prop.endsWith('Symbol') ? 0 : 1000
    window.dispatchEvent(new CustomEvent('fetch', { detail: bounceRate }))
    return true
  }
}

const currencyProxy = new Proxy(currency, handler)
export { currencyProxy as default }

window.addEventListener('switch:currency', () => {
  const { srcSymbol, dstSymbol } = currencyProxy
  currencyProxy.srcSymbol = dstSymbol
  currencyProxy.dstSymbol = srcSymbol
})
