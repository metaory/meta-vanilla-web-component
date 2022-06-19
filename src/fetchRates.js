// TODO consider sessionStorage instead
const setCache = (src, dst, value) =>
  localStorage.setItem(`${src}-${dst}`, value)
const loadCache = (src, dst) =>
  localStorage.getItem(`${src}-${dst}`)

// TODO read from gh secrets
const FIXER_API_KEY = 'rdck0YfBV3knHMWInijXr1UH8cnNYTov'
// const FIXER_API_KEY = 'XQ3vQ3XkBKNIq2tN4RGPA2o4ZhEGo8NN'
// const FIXER_API_KEY = 'ujucsc0WvJwnxeKGIk9aRKGmmRuKSffc'
// const FIXER_API_KEY = '8y6JGnCQwveSeNSBKWiHgra8dixwLY35'
const FIXER_API_BASE_URL = 'https://api.apilayer.com/fixer/latest'

export default function (src, dst, amount = 1) {
  console.log('==> Fetch rates for:', { src, dst, amount })

  const loader = document.querySelector('loader-modal')
  const alert = document.querySelector('alert-component')

  loader.show(true)

  return new Promise((resolve) => {
    console.debug('Attempting to load from Cache...')

    const cachedValue = loadCache(src, dst)
    if (cachedValue) {
      alert.show('Fetched rates from Cache!', 'success')
      console.debug('Fetched rates from cache', ':', cachedValue)
      setTimeout(() => { // for aesthetic reasons only
        loader.show(false)
        resolve({ rates: { [dst]: cachedValue } })
      }, 1000)
      return
    }

    /* * DEBUG MODE * */
    // return setTimeout(() => {
    //   loader.show(false)
    //   resolve({ rates: { [dst]: (Math.random() * 1000).toFixed(2) } })
    //   alert.show('Fetched!', 'success')
    // }, 1000)
    /* * ********** * */

    console.debug('Fetching from live api...')
    fetch(`${FIXER_API_BASE_URL}?base=${src}&symbols=${dst}&amount=${amount}`, {
      headers: {
        'Content-Type': 'application/json',
        apikey: FIXER_API_KEY
      }
    })
      .then(response => {
        if (response.ok) {
          alert.show('Fetched rates!', 'success')
          const promise = response.json()
          promise.then((result) => {
            setCache(src, dst, result.rates[dst])
            return resolve(result)
          })
        } else {
          const errors = { 429: '429 Too Many Requests, falling back to dummy response.' }
          throw new Error(errors[response.status] || response.status)
        }
      })
      .catch(err => {
        console.error('E!:', err)
        alert.show(err.message, 'negative')
        resolve({ rates: { [dst]: (Math.random() * 100).toFixed(2) } })
      })
      .finally(() => {
        loader.show(false)
      })
  })
}
