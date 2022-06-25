import currencyProxy from '../store.js'

const template = document.createElement('template')
template.innerHTML = `
<link rel="stylesheet" href="src/styles/currency.css">
<style> :host { visibility: hidden; } </style>
<span>$</span>
<input type="number" name="currency" value="${currencyProxy.srcAmount}">
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
    this.attachShadow({ mode: 'open' })
  }

  _attachNodes () {
    this.shadowRoot.appendChild(template.content.cloneNode(true))
    this.$input = this.shadowRoot.querySelector('input')
    this.$select = this.shadowRoot.querySelector('select')

    // Set Default values
    this.$select.value = currencyProxy[this.direction + 'Symbol']

    switch (this.direction) {
      case 'src':
        this.$input.addEventListener('click', (event) => event.target.select())
        break
      case 'dst':
        this.$input.classList.add('disabled')
        this.$input.setAttribute('readonly', true)
        this.$input.addEventListener('click', () => this._copyResult())
        break
    }
  }

  _attachEvents () {
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
    window.addEventListener('render', () => this._render())
  }

  _render () {
    const el = document
      .querySelector(`currency-card[direction=${this.direction}]`)
      .shadowRoot

    el.querySelector('span').innerHTML = window.SYMBOLS[currencyProxy[this.direction + 'Symbol']]

    el.querySelector('input').value = currencyProxy[this.direction + 'Amount']

    el.querySelector('select').value = currencyProxy[this.direction + 'Symbol']

    el.querySelector('input').blur()
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
  console.debug('>', 'currency-card', 'custom element defined.'))
