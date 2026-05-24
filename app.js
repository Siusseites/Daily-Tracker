const liste = document.querySelector('ul')
const addButton = document.querySelector('.js-add-btn')
const titelInput = document.getElementById('titel')
const goalInput = document.getElementById('goal')

import dayjs from 'https://cdn.jsdelivr.net/npm/dayjs@1/+esm'

const today = dayjs()
console.log(today)

async function ladeZiele() {
  const antwort = await fetch('http://localhost:3000/daily-tracker')

  const ziele = await antwort.json()
  console.log(ziele)

  liste.innerHTML = ''

  ziele.forEach((ziel) => {
    const liElem = document.createElement('li')
    const percent = Math.min((ziel.achieved / ziel.goal) * 100, 100)
    liElem.dataset.id = ziel.id
    ziel.done = ziel.achieved >= ziel.goal ? true : false
  liElem.className = ziel.done ? 'done' : ''
  liElem.innerHTML = `
  <span class="goal-titel">${ziel.titel}</span>
  <div class="progress-bar-wrap">
    <div class="progress-bar-fill" style="width: ${percent}%"></div>
  </div>
  <span class="goal-progress"><span>${ziel.achieved}</span> / ${ziel.goal}</span>

  <span class="delete-goal"><img class="js-delete-btn" alt="" 
  src="delete.svg"></span>

  <span class="edit-goal"><img class="js-edit-btn" alt="" 
  src="edit.svg"></span>
`
    liste.append(liElem)
  })

  const deleteBtns = document.querySelectorAll('.js-delete-btn')

  deleteBtns.forEach( (deleteBtn) => {
    deleteBtn.addEventListener('click', async (e) => {
    const target = e.target.parentElement.parentElement
    console.log(target)

    const id = target.dataset.id
    await fetch(`http://localhost:3000/daily-tracker/${id}`, {
      method: 'DELETE',
    })
  })
  })

  const editBtns = document.querySelectorAll('.js-edit-btn')

  editBtns.forEach((editBtn) => {
    editBtn.addEventListener('click', async (e) => {
    const target = e.target.parentElement
    const id = target.parentElement.dataset.id
    
    target.innerHTML = `<input class="update-input" type="number"> <button class="update-goal"><img alt="" src="accept.svg"> </button>`

    target.classList.add('edited')

    const updateBtn = document.querySelector('.update-goal')
    const updateInput = document.querySelector('.update-input')

    updateBtn.addEventListener('click', async () => {
      const achieved = Number(updateInput.value)
      console.log(achieved)

      console.log('id:', id)
      console.log('target dataset:', target.dataset)

      await fetch(`http://localhost:3000/daily-tracker/${id}`, {
      method: 'PATCH',
      headers: {
      'Content-Type': 'application/json'
      },
      body: JSON.stringify({achieved: achieved})
      })

      target.innerHTML = '<img class="js-edit-btn" alt="" src="edit.svg">'

      target.classList.remove('edited')

      ladeZiele()

    })
  })
  })
}

addButton.addEventListener('click', async () => {
  const titel = titelInput.value.trim()
  const goal = goalInput.value.trim()

  console.log(titel)
  console.log(goal)

  if(titel == '' || goal == ''){return}

  await fetch('http://localhost:3000/daily-tracker', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({titel, goal})
  })

  ladeZiele()
})

ladeZiele()