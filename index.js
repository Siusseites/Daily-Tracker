import express from 'express'
import fs from 'fs/promises'
import Database from 'better-sqlite3'
import cors from 'cors'
import dayjs from 'dayjs'

const db = new Database('ziele.db')

db.exec(`
  CREATE TABLE IF NOT EXISTS ziele(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  titel TEXT,
  goal INTEGER,
  achieved INTEGER DEFAULT 0,
  done INTEGER DEFAULT 0,
  date TEXT 
  )
  `)


const app = express()
const PORT = 3000
app.use(express.json())
app.use(cors())

app.get('/daily-tracker', async (req,res) => {
 const stmt = db.prepare('SELECT * FROM ziele')
 const ziele = stmt.all()
 const today = dayjs().format('YYYY-MM-DD')

 ziele.forEach((ziel) => {
  if(ziel.date != today){
    const stmt = db.prepare('UPDATE ziele set achieved = ?, done = ?, date = ? WHERE id = ?')
    stmt.run(0, 0, today, ziel.id)
  }
 })
 const stmtnew = db.prepare('SELECT * FROM ziele')
 const aktuelleZiele = stmtnew.all()
  res.json(aktuelleZiele)
})

app.post('/daily-tracker',  (req,res) => {
  const {titel} = req.body
  const {goal} = req.body
  const today = dayjs().format('YYYY-MM-DD')

  if(!titel || !goal){
    return res.status(400).json({message: 'Titel und Goal angeben!'})
  }

  const stmt = db.prepare('INSERT INTO ziele (titel, goal, date) VALUES (?, ?, ?)')
  stmt.run(titel, goal, today)

  res.json({message: 'Goal successfully added'})
})

app.delete('/daily-tracker/:id', async (req, res) => {
  const {id} = req.params
 
  const stmt = db.prepare('DELETE FROM ziele WHERE id = ?')
  stmt.run(id)

  res.json({message: 'goal deleted'})
})

app.patch('/daily-tracker/:id', async (req, res) => {
  const {id} = req.params
  const {achieved} = req.body

  let fertig = false
  let titel = ''

  const stmt = db.prepare('UPDATE ziele SET achieved = ? WHERE id = ?')
  stmt.run(achieved, id)

  const stmtGet = db.prepare('SELECT * FROM ziele WHERE id = ?')
  const ziel = stmtGet.get(id)
  
  
  if(ziel.achieved >= ziel.goal){
    titel = ziel.titel
    fertig = true
    const stmtDone = db.prepare('UPDATE ziele SET done = ? WHERE id = ?')
    stmtDone.run(1, ziel.id)
  }

  if(fertig) {
    return res.json({message: `goal updated, ${titel} finished`})
  }

  res.json({message: 'goal updated'})
})

app.listen(PORT, (req, res) => {
  console.log(`Server läuft auf http://localhost:${PORT}`)
} )



















// app.post('/daily-tracker', async (req,res) => {
//   const {titel} = req.body
//   const {goal} = req.body

//   const inhalt = await fs.readFile('ziele.json', 'utf-8')
//   const ziele = JSON.parse(inhalt)
//   const id = ziele.length > 0 ? ziele[ziele.length - 1].id + 1 : 0

//   ziele.push({id: id, titel: titel, goal: goal, achieved: 0, done: false})

//   await fs.writeFile('ziele.json', JSON.stringify(ziele))
//   res.json({message: 'Goal successfully added'})
// })



// app.get('/daily-tracker', async (req,res) => {
//   const inhalt = await fs.readFile('ziele.json', 'utf-8')
//   const ziele = JSON.parse(inhalt)

//   res.json(ziele)
// })


// app.delete('/daily-tracker/:id', async (req, res) => {
//   const {id} = req.params
//   const inhalt = await fs.readFile('ziele.json', 'utf-8')
//   const ziele = JSON.parse(inhalt)

//   const gefiltert = ziele.filter((ziel) => {
//     if(ziel.id != id){
//       return ziel
//     }
//   })

//   await fs.writeFile('ziele.json', JSON.stringify(gefiltert))

//   res.json({message: 'goal deleted'})
// })


// app.patch('/daily-tracker/:id', async (req, res) => {
//   const {id} = req.params
//   const {achieved} = req.body
//   const inhalt = await fs.readFile('ziele.json', 'utf-8')
//   const ziele = JSON.parse(inhalt)

//   let fertig = false
//   let titel = ''

//   ziele.map((ziel) => {
//     if(ziel.id == id){
//       titel = ziel.titel
//       ziel.achieved = achieved
//       if(ziel.achieved >= ziel.goal){
//         ziel.done = true
//         fertig = true
//       }else{
//         ziel.done = false
//       }
//       return ziel
//     }
//   })

//   await fs.writeFile('ziele.json', JSON.stringify(ziele))

//   if(fertig) {
//     return res.json({message: `goal updated, ${titel} finished`})
//   }

//   res.json({message: 'goal updated'})
// })
