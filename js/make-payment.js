let user = {}
$(function () {
  getUser()
  $('.text-success').hide()
  $('.text-danger').hide()
  $('.text-info').hide()
  $('.payment-msg').hide()
})

const stripe = Stripe(
  'pk_live_51IuHluSCEzNSCjo1QAhjORW4qfpTX2iQ0KbKibvebqqdic8wAEpbpDFQVFKJCnfBKmF2CEWlCvNOYUUUtcFnr5Sq005JSp2Xnz'
)
let card = null

const initStripe = async () => {
  let style = {
    base: {
      color: '#32325d',
      fontFamily: 'Helvetica Neue, Helvetica, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#fa755a',
      iconColor: '#fa755a',
    },
  }

  const elements = stripe.elements()

  card = elements.create('card', { style, hidePostalCode: true })

  card.mount('#card-element')
}

initStripe()

const doPayment = async (token, userInfo) => {
  userInfo.totalAmount = user.totalAmount
  userInfo.token = token
  userInfo.description = user.serviceName
  userInfo.country = user.selectedCountry
  userInfo.serviceName = user.serviceName
  const apiUrl = 'https://stark-brushlands-76078.herokuapp.com' + user.paymentUrl
  axios
    .post(apiUrl, userInfo)
    .then(async (response) => {
      if (response) {
        console.log('response ', response)
        sendMailAfterPayment()
      }
    })
    .catch((error) => {
      resetSpinner()
      console.log('error ', error)
      toastr.error('Something went wrong. Please Try Again')
    })
}

const payNow = async () => {
  const name = document.getElementById('name').value
  const address = document.getElementById('address').value
  const zip = document.getElementById('zip').value
  const city = document.getElementById('city').value
  const state = document.getElementById('state').value

  const userInfo = {
    name,
    address,
    zip,
    city,
    state,
  }

  if (!name || !address || !zip || !city || !state) {
    document.getElementById('payNow').disabled = true
    return
  }
  $('.buy-sub').html(
    `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> <strong class="redirect-payment">Payment Processing...</strong>`
  )
  try {
    const response = await stripe.createToken(card)
    $('.buy-sub').prop('disabled', true)
    console.log('response ', response)
    const { id } = response.token
    doPayment(id, userInfo)
  } catch (error) {
    resetSpinner()
    // console.error('error ', error)
    toastr.error('Please enter correct card details!')
  }
}

card.on('change', function (event) {
  var displayError = document.getElementById('card-errors')
  if (event.error) {
    console.log('event.error ', event.error)
    document.getElementById('payNow').disabled = true
  } else {
    console.log('no error')
    document.getElementById('payNow').disabled = false
  }
})

function getUser() {
  user = JSON.parse(localStorage.getItem('user'))
  bindValueToUI()
}

function bindValueToUI() {
  if (user) {
    document.getElementById('serviceName').textContent = user.serviceName
    document.getElementById('quantity').textContent = user.quantity
    document.getElementById('amount').textContent =
      user.currency + parseInt(user.totalAmount + user.discount)
    document.getElementById('discount').textContent = '-' + user.currency + user.discount
    document.getElementById('total').textContent = user.currency + user.totalAmount
  }
}

function clearStorage() {
  localStorage.clear();
}


  const sendMailAfterPayment = () => {
    $('.payment-msg').show()
    const userData = user;
    const apiUrl = "https://stark-brushlands-76078.herokuapp.com" + user.serviceUrl;
    // const apiUrl = "http://localhost:3100" + user.serviceUrl;
      axios.post(apiUrl, userData).then(async (response) => {
        if (response.data) {
          clearStorage()
        window.location = "../thank-you.html";
      } else {
        toast.error("Something went wrong. Please Try Again Later");
      }
    }, (err) => {
      toast.error("Something went wrong. Please Try Again Later");
    });
  }
