const loginNameInput = document.getElementById('login-name')
const loginPasswordInput = document.getElementById('login-password')
const loginForm = document.getElementById('login-form')

const registerNameInput = document.getElementById('register-name')
const registerPasswordInput = document.getElementById('register-password')
const registerForm = document.getElementById('register-form')

const loginBtn = document.getElementById('login-btn')
const registerBtn = document.getElementById('register-btn')

const showRegister = document.getElementById('show-register')
const showLogin = document.getElementById('show-login')

const loginError = document.getElementById('login-error')
const registerError = document.getElementById('register-error')

const loginTogglePassword = document.querySelector('.login-toggle-password')

const registerTogglePassword = document.querySelector('.register-toggle-password')

const API_URL = ' https://daily-tracker-exl8.onrender.com'

loginBtn.addEventListener('click', async () => {
  const name = loginNameInput.value.trim()
  const password = loginPasswordInput.value.trim()

  const res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({name, password})
  })

  const daten =  await res.json()

  if(res.ok){
    localStorage.setItem('userId', daten.userId)
    localStorage.setItem('username', name)

    loginNameInput.value = ''
    loginPasswordInput.value = ''
    window.location.href = 'tracker.html'
  } else{
    // if(daten.error == 'User not found'){
    //   document.querySelector('.auth-input').classList.add('error')
    // }
    document.querySelector('.login-error-box').classList.remove('hidden')
    document.querySelector('.login-error-box').innerHTML = daten.error
  }
  
})

registerBtn.addEventListener('click', async () => {
  const name = registerNameInput.value.trim()
  const password = registerPasswordInput.value.trim()

  const res = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({name, password})
  })

  const daten = await res.json()

  if(res.ok){
    registerNameInput.value = ''
    registerPasswordInput.value = ''

    loginForm.classList.remove('hidden')
    registerForm.classList.add('hidden')
    
  } else{
    document.querySelector('.register-error-box').classList.remove('hidden')
    document.querySelector('.register-error-box').innerHTML = daten.error
  }
})

showRegister.addEventListener('click', () => {
  loginForm.classList.add('hidden')
  registerForm.classList.remove('hidden')
})

showLogin.addEventListener('click', () => {
  loginForm.classList.remove('hidden')
  registerForm.classList.add('hidden')
})

loginTogglePassword.addEventListener('click', () => {
  if(loginTogglePassword.classList.contains('hidden')){
    loginPasswordInput.type = 'text'
    loginTogglePassword.src = 'icons8-hide-30.png'
    loginTogglePassword.classList.remove('hidden')
  } else{
    loginPasswordInput.type = 'password'
    loginTogglePassword.src = 'icons8-eye-30.png'
    loginTogglePassword.classList.add('hidden')
  }
})

registerTogglePassword.addEventListener('click', () => {
  if(registerTogglePassword.classList.contains('hidden')){
    registerPasswordInput.type = 'text'
    registerTogglePassword.src = 'icons8-hide-30.png'
    registerTogglePassword.classList.remove('hidden')
  } else{
    registerPasswordInput.type = 'password'
    registerTogglePassword.src = 'icons8-eye-30.png'
    registerTogglePassword.classList.add('hidden')
  }
})