
const header = document.querySelector('.header');
const desktopHeader = document.querySelector('.header-desktop');

desktopHeader.innerHTML = header.innerHTML;

//1. when the header enters the viewport, hide the desktop header
//2. when the header leaves, show it (by adding the visible class) 

inView('.header')
    .on('enter', el => desktopHeader.classList.remove('visible'))
    .on('exit', el => desktopHeader.classList.add('visible'));

VanillaTilt.init(document.querySelectorAll(".image"), {
    max: 25,
    speed: 400
    });

inView('.fade')
    .on('enter', img => img.classList.add('visible'))
    .on('exit', img => img.classList.remove('visible'))

//1.when we click the register button run a function
//2. grab the .front element and add a class of .slide-up

const registerButton = document.querySelector('.register-button');
registerButton.addEventListener('click', event => {
    event.preventDefault();
    const frontEl = document.querySelector('.front')
    frontEl.classList.add('slide-up');
});

/* globals Stripe */
const stripe = Stripe('pk_test_cucWEL0zZ0Ttl8sDgYcAdeD6')

// Create an instance of Elements.
const elements = stripe.elements()

// Custom styling can be passed to options when creating an Element.
// (Note that this demo uses a wider set of styles than the guide below.)
const style = {
  base: {
    color: '#32325d',
    fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
    fontSmoothing: 'antialiased',
    fontSize: '16px',
    '::placeholder': {
      color: '#aab7c4'
    }
  },
  invalid: {
    color: '#fa755a',
    iconColor: '#fa755a'
  }
}

const form = document.querySelector('#payment-form')

// get the error tag
const errorEl = form.querySelector('#card-errors')

const nameEl = form.querySelector('#name')
const emailEl = form.querySelector('#email')

// set up what happens with an error (pass in our own message)
const showErrors = msg => {
  if (msg) {
    errorEl.style.display = 'block'
    errorEl.innerHTML = msg
  } else {
    errorEl.style.display = 'none'
  }
}

// set up what happens with a stripe success
const showSuccess = () => {
  form.querySelector('.form-title').textContent = 'Payment successful!'
  form.querySelector(
    '.form-fields'
  ).textContent = `Thank you ${nameEl.value}, your payment was successful and we have sent an email receipt to ${emailEl.value}`
}

// Create an instance of the card Stripe Element.
var card = elements.create('card', {style: style})

// Add an instance of the card Element into the `card-element` <div>.
card.mount('#card-element')

// and listen out for any changes, if an error, show it!
card.addEventListener('change', function(event) {
  if (event.error) {
    showErrors(event.error.message)
  } else {
    showErrors()
  }
})

// Handle form submission.
form.addEventListener('submit', function(event) {
  event.preventDefault()
  form.classList.add('processing')
  // create a new payment method in stripe
  stripe.createPaymentMethod('card', card).then(result => {
    // when stripe returns back...
    if (result.error) {
      // invalid card format
      showErrors(result.error.message)
    } else {
      // pass my payment method to the function below
      stripeHandle(result.paymentMethod)
    }
  })
})

// Submit the form with the payment method ID.
const stripeHandle = function(paymentMethod) {
  // where do i post ajax to?
  const backendUrl = form.getAttribute('action')

  fetch(backendUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      order: {
        name: nameEl.value,
        email: emailEl.value,
        // not a token but a payment method now!
        stripe_payment_method: paymentMethod.id
        // stripe_secret_key: "sk_test_asdf"
      }
    })
  })
    .then(response => response.json())
    .then(data => {
      form.classList.remove('processing')
      // back from the back-end, not Stripe!
      if (data.order) {
        // all went through fine
        console.log('all good, first time!')
        showSuccess()
      } else if (data.errors.base == 'requires_action') {
        // the API will return back something from Stripe
        // if it's needed to confirm the payment with 3D secure
        // or any other verficiation check
        stripe.handleCardPayment(data.errors.payment_intent_client_secret).then(result => {
          if (result.error) {
            // failed, said no user declined check
            console.error('failed check')
            showErrors('Please try again and confirm your payment')
          } else {
            console.log('verified check')
            // confirmed, user verified
            showSuccess()
          }
        })
      } else {
        // show stripe payment errors from the API (e.g. "not enough funds")
        console.error('stripe error', data)
        showErrors(data.errors.stripe_payment_method)
      }
    })
    .catch(error => {
      form.classList.remove('processing')
      // general message, e.g. Stripe is down
      console.error('general error', error)
      showErrors(
        `There was an error with payment, please try again or contact us at help@goodtim.es`
      )
    })
}

const anchors = document.querySelectorAll('a')
anchors.forEach(anchor => {
  anchor.addEventListener('click', event => {
    const href = anchor.getAttribute('href')
    if (href.charAt(0) === '#') {
      event.preventDefault()
      document.querySelector(href).scrollIntoView({
        behavior: 'smooth'
      })
    }
  })
})
