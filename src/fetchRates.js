export default async function(src, dst, amount = 1) {
  console.log('FETCH RATES:', { src, dst, amount })

  return new Promise(async (resolve) => {
    document.querySelector('loader-modal').show(true)

    fetch(`https://api.apilayer.com/fixer/latest?base=${src}&symbols=${dst}&amount=${amount}`, {
      headers: {
        'Content-Type': 'application/json',
        'apikey': 'ujucsc0WvJwnxeKGIk9aRKGmmRuKSffc'
      },
    })
      .then(response => {
        if (response.ok) {
          document.querySelector('alert-component').show('Fetched!', 'var(--success)')
          return response.json()
        }
        const errors = { 429: '429 Too Many Requests, falling back to dummy response.' }
        throw new Error(errors[response.status] || response.status)
      })
      .catch(err => {
        console.error('E!:', err)
        document.querySelector('alert-component').show(err.message, 'var(--negative)')
        resolve({ rates: { [dst]: (Math.random() * 1000).toFixed(2) } })
      })
      .finally(() => {
        document.querySelector('loader-modal').show(false)
      })
  })
}

