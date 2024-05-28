$('#overlay').hide();
const apiUrl = "https://stark-brushlands-76078.herokuapp.com";
// const apiUrl = "http://localhost:3100";
const serviceUrl = "/v1/getrealsub/sendPaymentMailForYoutubeLikes";
// const apiUrl = "http://localhost:3000";
let totalAmount = 5,
isApplied = 0;
discount = 0;
let videoLinks = [];
let deliveryDate = "will be delivered in 2-4 days";
const user = {};
serviceName = "Buy Youtube Likes"

const setUserData = (user) => {
user.quantity = user.selectedLikes + " Likes"
user.totalAmount = totalAmount;
user.discount = discount;
user.serviceName = serviceName;
user.serviceUrl = serviceUrl;
localStorage.setItem("user", JSON.stringify(user));
window.location = "../make-payment.html";
}

$('#sub').change(
function () {
  if ($(this).val() == 100) {
    deliveryDate = "2-4 days";
  } else if ($(this).val() == 200) {
    deliveryDate = "4-6 days";
  } else if ($(this).val() == 300) {
    deliveryDate = "6-8 days";
  } else if ($(this).val() == 500) {
    deliveryDate = "1-2 weeks"
  } else if ($(this).val() == 700) {
    deliveryDate = "2-3 weeks"
  } else if ($(this).val() == 1000) {
    deliveryDate = "3-4 weeks"
  }
  isApplied = 0;
  totalAmount = Math.round($(this).val() * 0.07);
  $("#price").html(totalAmount);
});

function applyPromoCode() {
const promoCode = "rs40";
selectedSubWithDiscount = $("#sub").val();
if (promoCode.toLowerCase() === "rs40" && isApplied === 0) {
  isApplied = 1;
  discount = Math.round(totalAmount * 40 / 100)
  totalAmount = Math.round((totalAmount - (totalAmount * 40 / 100)));
  $("#price").html(totalAmount);
  toastr.success("Promo code applied successfully")
} else if (isApplied === 1) {
  toastr.info("Promo code already applied");
}
}

const addUser = () => {
let name, value = ""
const registerForm = document.getElementById("register-form");
const inputs = registerForm.querySelectorAll(".form-control");

for (var i = 0; i < inputs.length; i++) {
  if (!inputs[i].value) {
    toastr.info('Please fill all fields carefully');
    return;
  }
  name = inputs[i].attributes["name"].value;
  value = inputs[i].value
  user[name] = value;
}
videoLinks.push(user["youtubeVideoLinkOne"]);
user.videoLinks = videoLinks;
user.totalAmount = totalAmount;
user.deliveryDate = deliveryDate;
$(".buy-sub").prop("disabled", true);
$(".buy-sub").html(
  `<div class="spinner-border text-light" role="status">
  <span class="visually-hidden"></span>
  </div><span class="title"
  style="padding-left: 10px;position:
  relative;bottom: 8px;">
  Redirecting To Payment...<span>`
);
const userInfo = user;
  axios.post(apiUrl + '/v1/getrealsub/youtubeLikes/add', userInfo).then((res) => {
    axios.post(apiUrl + '/v1/getrealsub/sendYoutubeLikesLead', userInfo).then((res) => {
      console.log("user ", res);
      resetSpinner();
      setUserData(user);
    }).catch((error) => {
      resetSpinner();
      console.log("error while adding user in db ", error);
    });
  }).catch((error) => {
    resetSpinner();
    console.log("error while adding user in db ", error);
  });
}

const sendMailAfterPayment = () => {
$('#overlay').show();
user.totalAmount = totalAmount;
const userData = user;
const apiUrl = "https://stark-brushlands-76078.herokuapp.com/v1/grs/sendPaymentMailForYoutubeLikes";
// const apiUrl = "http://localhost:3000/v1/grs/sendPaymentMailForYoutubeLikes";
axios.post(apiUrl, userData).then(async (response) => {
  if (response.data) {
    $('#overlay').hide();
    $('#paymentModal').modal('hide');
    $("span.spinner-border").remove();
    window.location = "../thank-you.html";
  } else {
    $("span.spinner-border").remove();
    toast.error("Something went wrong. Please Try Again Later");
  }
}, (err) => {
  $("span.spinner-border").remove();
  toast.error("Something went wrong. Please Try Again Later");
});
}

const selectPlan = (selectedPlan, delivery) => {
isApplied = 0;
let element = document.getElementById("sub");
  element.value = selectedPlan;
  totalAmount = element.value / 10;
  $("#price").html(totalAmount);
  deliveryDate = delivery;
  applyPromoCode()
  window.location.href = "#top";
}

const setVideoLinks = () => {
const videoLinksForm = document.getElementById("video-links-form");
const inputs = videoLinksForm.querySelectorAll(".form-control"); 
for (var i = 0; i < inputs.length; i++) {
  if (inputs[i].value) {
    videoLinks.push(inputs[i].value);
  }
}
if (videoLinks.length < 1) {
$("#videoLinksModal").modal('hide');
    return;
}
console.log("videoLinks ", videoLinks);
toastr.success("Video added successfully!");
$("#videoLinksModal").modal('hide');
}

const populateCountry = () => {
$.getJSON("/data/countries.json", function(countries) {
    const country = document.getElementById("country"); 
for (let i = 0; i < countries.length; i++) {
 country.options[country.options.length] = new Option(countries[i].name, countries[i].name);
}
})

}

const populateCountryCodeByCountry = () => {
const selectedCountry = document.getElementById("country").value;
const countryCode = document.getElementById("countryCode");
$.getJSON("../data/countries.json", function(countries) {
    countries.map((country) => {
        if (selectedCountry === country.name) {
            countryCode.value = country.dial_code
        }    
    })
})
}

function resetSpinner() {
$("span.spinner-border").remove();
$(".buy-sub").prop("disabled", false);
$(".buy-sub").html('Buy Youtube Likes Now');
}
populateCountry();