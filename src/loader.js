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

      return {
        template,
        style,
        script
      }
    })
  }

  const getSettings = ({ template, style, script }) => {
    const jsFile = new Blob([script.textContent], { type: 'application/javascript' })
    const jsURL = URL.createObjectURL(jsFile)

    const getListeners = (settings) => {
      if (!settings.events) return {}
      return Object.entries(settings.events)
        .reduce((acc, [event, value]) => ({ ...acc, [event]: value }), {})
    }

    const getMethods = (settings) => {
      if (!settings.methods) return {}
      return Object.entries(settings.methods)
        .reduce((acc, [method, value]) => ({ ...acc, [method]: value }), {})
    }

    return import(jsURL).then((module) => {
      const listeners = getListeners(module.default)
      const methods = getMethods(module.default)

      return {
        name: module.default.name,
        listeners,
        methods,
        template,
        style
      }
    })
  }

  const registerComponent = ({ template, style, name, listeners, methods }) => {
    class UnityComponent extends HTMLElement {
      constructor () {
        super()
        this.shadow = this.attachShadow({ mode: 'open' })
      }

      connectedCallback () {
        this._atachNodes()
        this._attachListeners()
        this._attachMethods()
      }

      static get observedAttributes () {
        return ['name']
      }

      attributeChangedCallback (property, oldValue, newValue) {
        if (oldValue === newValue) return
        this[property] = newValue
      }

      _atachNodes () {
        this.shadow.appendChild(style.cloneNode(true))
        this.shadow.appendChild(document.importNode(template.content, true))
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

    return customElements.define(name, UnityComponent)
  }

  const loadComponent = (URL) => fetchAndParse(URL)
    .then(getSettings)
    .then(registerComponent)

  return loadComponent
})()

window.vibrate = () => 'ontouchstart' in document.documentElement &&
  window.navigator.vibrate(300)
