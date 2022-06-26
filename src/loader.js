
window.loadComponent = (() => {
  const fetchAndParse = (URL) => {
    return fetch(URL).then((response) => {
      return response.text()
    }).then((html) => {
      const parser = new DOMParser()
      const document = parser.parseFromString(html, 'text/html')
      const head = document.head
      const template = head.querySelector('template')
      const style = head.querySelector('style')
      const script = head.querySelector('script')

      return { template, style, script }
    })
  }

  const getSettings = async ({ template, style, script }) => {
    const jsFile = new Blob([script.textContent], { type: 'application/javascript' })
    const jsURL = URL.createObjectURL(jsFile)

    const store = await import('./store.js')
    const module = await import(jsURL)
    return {
      template,
      style,
      store: store.default,
      name: module.default.name,
      mounted: module.default.mounted || (() => {}), /* noop */
      listeners: module.default.events || {},
      methods: module.default.methods || {}
    }
  }

  const registerComponent = ({ template, style, store, name, mounted, listeners, methods }) => {
    class UnityComponent extends HTMLElement {
      constructor () {
        super()
        this.attachShadow({ mode: 'open' })
      }

      connectedCallback () {
        this._attachNodes()
        this._attachListeners()
        this._attachMethods()
        mounted(this, store)
      }

      static get observedAttributes () {
        return ['name']
      }

      attributeChangedCallback (property, oldValue, newValue) {
        if (oldValue === newValue) return
        this[property] = newValue
      }

      _attachNodes () {
        this.shadowRoot.appendChild(style.cloneNode(true))
        this.shadowRoot.appendChild(document.importNode(template.content, true))
      }

      _attachListeners () {
        Object.entries(listeners).forEach(([event, listener]) => {
          this.addEventListener(event, listener, false)
        })
      }

      _attachMethods () {
        Object.entries(methods).forEach(([method, value]) => {
          this[method] = value
        })
      }
    }

    customElements.whenDefined(name).then(() =>
      console.debug('>', name, 'custom element defined.'))

    return customElements.define(name, UnityComponent)
  }

  return (URL) => fetchAndParse(URL)
    .then(getSettings)
    .then(registerComponent)
})()
