const currency = { srcSymbol: 'USD', srcAmount: 1, dstSymbol: 'EUR', dstAmount: 0 }

const handler = {
  get (target, property) {
    return target[property]
  },
  set: (obj, prop, value) => {
    obj[prop] = value
    window.dispatchEvent(new CustomEvent('render'))
    console.debug('Proxy updated', ':', prop, ':', value)

    if (prop === 'dstAmount') return true

    const bounceRate = prop.endsWith('Symbol') ? 0 : 1000
    window.dispatchEvent(new CustomEvent('fetch', { detail: { bounceRate } }))
    return true
  }
}
const currencyProxy = new Proxy(currency, handler)
export { currencyProxy as default }

window.addEventListener('switch:currency', () => {
  const { srcSymbol: oldSrc, dstSymbol: oldDst } = currencyProxy
  currencyProxy.srcSymbol = oldDst
  currencyProxy.dstSymbol = oldSrc
})
