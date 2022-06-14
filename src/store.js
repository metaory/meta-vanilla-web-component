const currency = { srcSymbol: 'USD', srcAmount: 1, dstSymbol: 'EUR', dstAmount: 0, }
const { log } = console

const handler = {
  get(target, property) {
    return target[property]
  },
  set: function(obj, prop, value) {
    obj[prop] = value
    window.dispatchEvent(new CustomEvent('render'))

    if (['srcSymbol', 'dstSymbol', 'srcAmount'].includes(prop)) {
      const bounceRate = prop.endsWith('Symbol') ? 0 : 1000
      window.dispatchEvent(new CustomEvent('fetch', {"detail": { bounceRate }}))
    }
    return true
  }
}
const currencyProxy = new Proxy(currency, handler)
export { currencyProxy as default } 

window.addEventListener('switch-currency', () => {
  const { srcSymbol: oldSrc, dstSymbol: oldDst } = currencyProxy

  currencyProxy.srcSymbol = oldDst
  currencyProxy.dstSymbol = oldSrc
  window.dispatchEvent(new CustomEvent('fetch', {"detail": { bounceRate: 0 }}))
})

