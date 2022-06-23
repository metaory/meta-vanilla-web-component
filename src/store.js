// Initial State
const currency = {
  srcSymbol: 'USD',
  srcAmount: 1,
  dstSymbol: 'EUR',
  dstAmount: 0,
  rate: 0
}

const handler = {
  get (target, property) {
    return target[property]
  },
  set: (obj, prop, value) => {
    obj[prop] = value
    console.debug('>>', 'Proxy updated', ':', prop, ':', value)
    if (prop === 'rates') {
      obj.dstAmount = (obj.rates * obj.srcAmount).toFixed(2)
      window.dispatchEvent(new CustomEvent('render'))
      return true
    }
    const bounceRate = prop.endsWith('Symbol') ? 0 : 1000
    window.dispatchEvent(new CustomEvent('fetch', { detail: { bounceRate } }))
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
