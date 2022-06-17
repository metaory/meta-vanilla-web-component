import currencyProxy from '../store.js'

const template = document.createElement('template')
template.innerHTML = `
<link rel="stylesheet" href="src/styles/currency.css">
<span>$</span>
<input type="number" name="currency" value="1">
<div>
  <select>
    <option value="USD">USD</option>
    <option value="EUR">EUR</option>
    <option value="JPY">JPY</option>
  </select>
</div>`

class CurrencyCard extends HTMLElement {
  $input
  $select
  constructor () {
    super()
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' })
    }
  }

  _attachNodes () {
    this.shadowRoot.appendChild(template.content.cloneNode(true))
    this.$input = this.shadowRoot.querySelector('input')
    this.$select = this.shadowRoot.querySelector('select')

    // Set Default values
    switch (this.direction) {
      case 'src':
        this.$select.value = 'USD'
        this.$input.addEventListener('click', (event) => event.target.select())
        break
      case 'dst':
        this.$select.value = 'EUR'
        this.$input.classList.add('disabled')
        this.$input.setAttribute('readonly', true)
        this.$input.addEventListener('click', () => this._copyResult())
        break
    }
  }

  _attachEvents () {
    window.addEventListener('render', this._render)
    window.addEventListener('converted', () => { this.$input.blur() })

    const onSelectUpdate = (evt) => {
      currencyProxy[`${this.direction}Symbol`] = evt.target.value
    }

    const onInputKeyUp = (evt) => {
      const { value } = evt.target
      if (value) {
        currencyProxy[`${this.direction}Amount`] = value
      } else {
        evt.target.value = currencyProxy.srcAmount
      }
    }

    this.$input.addEventListener('keyup', onInputKeyUp)
    this.$select.addEventListener('change', onSelectUpdate)
  }

  _render () {
    const $src = document.querySelector('currency-card[direction=src]')
    const $dst = document.querySelector('currency-card[direction=dst]')

    const SYMBOLS = { USD: '$', EUR: '&euro;', JPY: '&yen;' }

    $src.shadowRoot.querySelector('span').innerHTML = SYMBOLS[currencyProxy.srcSymbol]
    $dst.shadowRoot.querySelector('span').innerHTML = SYMBOLS[currencyProxy.dstSymbol]

    $src.shadowRoot.querySelector('input').value = currencyProxy.srcAmount
    $dst.shadowRoot.querySelector('input').value = currencyProxy.dstAmount

    $src.shadowRoot.querySelector('select').value = currencyProxy.srcSymbol
    $dst.shadowRoot.querySelector('select').value = currencyProxy.dstSymbol
  }

  connectedCallback () {
    this._attachNodes()
    this._attachEvents()
  }

  _copyResult () {
    navigator.clipboard.writeText(this.$input.value)
    window.vibrate()
    document.querySelector('alert-component').show('Copied!')
  }

  static get observedAttributes () {
    return ['direction']
  }

  attributeChangedCallback (property, oldValue, newValue) {
    if (oldValue === newValue) return
    this[property] = newValue
  }
}

customElements.define('currency-card', CurrencyCard)

customElements.whenDefined('currency-card').then(() =>
  console.log('::', 'currency-card', 'custom element defined.'))
