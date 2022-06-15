/* THIS FILE IS RAW WEB COMPONENT */ 

const { log } = console
import currencyProxy from '../store.js'

const template = document.createElement('template')
template.innerHTML = `
<link rel="stylesheet" href="src/styles/currency.css">
<span>$</span>
<input type="number" name="currency" min="0" max="9999" value="1">
<div>
  <select>
    <option value="USD">USD</option>
    <option value="EUR">EUR</option>
    <option value="JPY">JPY</option>
  </select>
</div>
`

class CurrencyCard extends HTMLElement {
  $input
  $select
  $alert
  constructor() {
    super()
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' })
    }
  }
  get direction() {
    return this.getAttribute('direction')
  }

  set direction(val) {
    val 
      ? this.setAttribute('direction', val)
      : this.removeAttribute('direction')
  }

  _populate() {
    this.shadowRoot.appendChild(template.content.cloneNode(true))
    this.$input = this.shadowRoot.querySelector('input')
    this.$select = this.shadowRoot.querySelector('select')
    this.$alert = document.querySelector('alert-component')

    console.log(this.$input, '::', this.shadowRoot, this.direction)
    switch (this.direction) {
      case 'src':
        this.$select.value = 'USD'
        this.$input.addEventListener('click', (event) => event.target.select())
        break
      case 'dst':
        this.$input.addEventListener('click', (event) => this._copyResult())
        this.$input.classList.add('disabled')
        this.$select.value = 'EUR'
        break
    }
  }
  _bindProxy() {
    const _this = this
    window.addEventListener('render', () => {
      _this._render()
    })

    function onSelectUpdate(evt) {
      currencyProxy[`${_this.direction}Symbol`] = evt.target.value
    }

    function onInputKeyUp(evt) {
      if (_this.direction === 'dst') {
        this.value = currencyProxy.dstAmount
        _this.$input.blur()
        return false
      }
      currencyProxy[`${_this.direction}Amount`] = evt.target.value
      return false
    }

    this.$input.addEventListener("keyup", onInputKeyUp)
    this.$select.addEventListener("change", onSelectUpdate)
  }
  _render() {
    const $src = document.querySelector("currency-card[direction=src]")
    const $dst = document.querySelector("currency-card[direction=dst]")

    $src.shadowRoot.querySelector('input').value = currencyProxy.srcAmount
    $dst.shadowRoot.querySelector('input').value = currencyProxy.dstAmount

    $src.shadowRoot.querySelector('select').value = currencyProxy.srcSymbol
    $dst.shadowRoot.querySelector('select').value = currencyProxy.dstSymbol
  }
  connectedCallback() {
    this._populate()
    this._bindProxy()
  }
  _copyResult ()  {
    navigator.clipboard.writeText(this.$input.value)
    this.$alert.show('Copied!', 'var(--accent)')
  }
  static get observedAttributes() {
    return ['direction']
  }
  attributeChangedCallback(property, oldValue, newValue) {
    if (oldValue === newValue) return
    this[property] = newValue
    console.log('!!', newValue, this.direction)
  }
}

customElements.define( 'currency-card', CurrencyCard )
