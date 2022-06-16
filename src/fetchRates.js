// TODO consider sessionStorage instead
const setCache = (src, dst, value) =>
  localStorage.setItem(`${src}-${dst}`, value)
const loadCache = (src, dst) =>
  localStorage.getItem(`${src}-${dst}`)

export default function (src, dst, amount = 1) {
  console.log('Fetch rates:', { src, dst, amount })

  const loader = document.querySelector('loader-modal')
  const alert = document.querySelector('alert-component')

  // Attempting Cache
  const cachedValue = loadCache(src, dst)
  if (cachedValue) {
    loader.show(false)
    alert.show('Fetched rates from Cache!', 'success')
    console.debug('Fetched rates from cache', ':', cachedValue)
    return { rates: { [dst]: cachedValue } }
  }

  return new Promise((resolve) => {
    loader.show(true)

    /* * DEBUG MODE * */
    // return setTimeout(() => {
    //   loader.show(false)
    //   resolve({ rates: { [dst]: (Math.random() * 1000).toFixed(2) } })
    //   alert.show('Fetched!', 'success')
    // }, 1000)
    /* * ********** * */

    fetch(`https://api.apilayer.com/fixer/latest?base=${src}&symbols=${dst}&amount=${amount}`, {
      headers: {
        'Content-Type': 'application/json',
        // apikey: 'XQ3vQ3XkBKNIq2tN4RGPA2o4ZhEGo8NN' // TODO read from gh secrets
        // apikey: 'ujucsc0WvJwnxeKGIk9aRKGmmRuKSffc' // TODO read from gh secrets
        // apikey: '8y6JGnCQwveSeNSBKWiHgra8dixwLY35' // TODO read from gh secrets
        apikey: 'rdck0YfBV3knHMWInijXr1UH8cnNYTov' // TODO read from gh secrets
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
