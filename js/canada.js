$(function () {
  $(document).scroll(function () {
    var $nav = $('.navbar-light')
    $nav.toggleClass('scrolled', $(this).scrollTop() > $nav.height())
  })
})
$('#overlay').hide()
const apiUrl = 'https://stark-brushlands-76078.herokuapp.com'
// const apiUrl = "http://localhost:3100";
let totalAmount = 60,
  isApplied = 0
discount = 0
serviceName = 'Buy Youtube Subscribers'
const serviceUrl = '/v1/getrealsub/sendPaymentMailForSub'
const paymentUrl = '/v1/doPaymentForCanada'
const user = {}

const setUserData = (user) => {
  user.quantity = user.selectedSub + ' Subscribers'
  user.totalAmount = totalAmount
  user.paymentUrl = paymentUrl
  user.currency = '$'
  user.discount = discount
  user.serviceName = serviceName
  user.serviceUrl = serviceUrl
  localStorage.setItem('user', JSON.stringify(user))
  window.location = '../make-payment.html'
}

$('#sub').change(function () {
  isApplied = 0
  totalAmount = Math.round($(this).val() * 0.12)
  console.log('total amount ', totalAmount)
  $('#price').html(totalAmount)
})

function applyPromoCode() {
  const promoCode = 'rs40'
  selectedSubWithDiscount = $('#sub').val()
  if (promoCode.toLowerCase() === 'rs40' && isApplied === 0) {
    isApplied = 1
    discount = (totalAmount * 40) / 100
    $('#price').html(Math.round(totalAmount - (totalAmount * 40) / 100))
    totalAmount = Math.round(totalAmount - (totalAmount * 40) / 100)
    toastr.success('Promo code applied successfully')
  } else if (isApplied === 1) {
    toastr.info('Promo code already applied')
  }
}

const addUser = () => {
  let name,
    value = ''
  const registerForm = document.getElementById('register-form')
  const inputs = registerForm.querySelectorAll('.form-control')
  console.log('childs', inputs)

  for (var i = 0; i < inputs.length; i++) {
    if (!inputs[i].value) {
      toastr.info('Please fill all fields carefully')
      return
    }
    name = inputs[i].attributes['name'].value
    value = inputs[i].value
    user[name] = value
    console.log('input name ', name)
    console.log('input ', value)
  }
  $('.buy-sub').prop('disabled', true)
  $('.buy-sub').html(
    `<div class="spinner-border text-light" role="status">
    <span class="visually-hidden"></span>
    </div><span class="title"
    style="padding-left: 10px;position:
    relative;bottom: 8px;">
    Redirecting To Payment...<span>`
  )
  const userInfo = user
  axios
    .post(apiUrl + '/user/getrealsub/add', userInfo)
    .then((res) => {
      axios
        .post(apiUrl + '/v1/getrealsub/sendLead', userInfo)
        .then((res) => {
          console.log('user ', res)
          resetSpinner()
          setUserData(user)
        })
        .catch((error) => {
          resetSpinner()
          console.log('error while adding user in db ', error)
        })
    })
    .catch((error) => {
      resetSpinner()
      console.log('error while adding user in db ', error)
    })
}

const sendMailAfterPayment = () => {
  $('#overlay').show()
  user.totalAmount = totalAmount
  const userData = user
  const apiUrl =
    'https://stark-brushlands-76078.herokuapp.com/v1/grs/sendPaymentMailForSub'
  // const apiUrl = "http://localhost:3000/v1/grs/sendPaymentMailForSub";
  axios.post(apiUrl, userData).then(
    async (response) => {
      if (response.data) {
        $('#overlay').hide()
        $('#paymentModal').modal('hide')
        $('span.spinner-border').remove()
        toastr.info(
          'Payment has been received successfully. Please check your mail for more details'
        )
      } else {
        $('span.spinner-border').remove()
        toast.error('Something went wrong. Please Try Again Later')
      }
    },
    (err) => {
      $('span.spinner-border').remove()
      toast.error('Something went wrong. Please Try Again Later')
    }
  )
}

const selectPlan = (selectedPlan) => {
  isApplied = 0
  let element = document.getElementById('sub')
  element.value = selectedPlan
  totalAmount = element.value / 10
  $('#price').html(totalAmount)
  applyPromoCode()
  window.location.href = '#top'
}

const populateCountry = () => {
  $.getJSON('/data/countries.json', function (countries) {
    const country = document.getElementById('country')
    for (let i = 0; i < countries.length; i++) {
      country.options[country.options.length] = new Option(
        countries[i].name,
        countries[i].name
      )
    }
  })
}

const populateCountryCodeByCountry = () => {
  const selectedCountry = document.getElementById('country').value
  const countryCode = document.getElementById('countryCode')
  $.getJSON('../data/countries.json', function (countries) {
    countries.map((country) => {
      if (selectedCountry === country.name) {
        console.log('country ', country)
        countryCode.value = country.dial_code
      }
    })
  })
}

function resetSpinner() {
  $('span.spinner-border').remove()
  $('.buy-sub').prop('disabled', false)
  $('.buy-sub').html('buy subscribers now')
}
populateCountry()
