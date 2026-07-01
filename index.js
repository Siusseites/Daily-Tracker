import express from 'express'
import fs from 'fs/promises'
import Database from 'better-sqlite3'
import cors from 'cors'
import dayjs from 'dayjs'
import bcrypt from 'bcrypt'
import { runInNewContext } from 'vm'
import nodeCron from 'node-cron'
import pg from 'pg'
import 'dotenv/config'

const {Pool} = pg

const db = new Pool({
  connectionString:process.env.DATABASE_URL,
  ssl: true
})

// const db = new Database('ziele.db')

// db.exec(`
//   CREATE TABLE IF NOT EXISTS ziele(
//   id INTEGER PRIMARY KEY AUTOINCREMENT,
//   titel TEXT,
//   goal INTEGER,
//   achieved INTEGER DEFAULT 0,
//   done INTEGER DEFAULT 0,
//   date TEXT,
//   userId INTEGER
//   )
//   `)

// db.exec(`
//   CREATE TABLE IF NOT EXISTS users(
//   id INTEGER PRIMARY KEY AUTOINCREMENT,
//   name TEXT,
//   password TEXT
//   )
//   `)

// db.exec(`
//   CREATE TABLE IF NOT EXISTS history(
//   userId INTEGER,
//   titel TEXT,
//   goal INTEGER,
//   achieved INTEGER DEFAULT 0,
//   done INTEGER DEFAULT 0,
//   date TEXT
//   )
//  `)

const app = express()
const PORT = 3000
app.use(express.json())
app.use(cors())

app.get('/daily-tracker/:userId', async (req,res) => {
  const {userId} = req.params
 const result = await db.query('SELECT * FROM ziele WHERE "userId" = $1', [userId])
 const persönlicheZiele = result.rows
 const today = dayjs().format('YYYY-MM-DD')
 res.json(persönlicheZiele)
 

//  persönlicheZiele.forEach((ziel) => {
//   if(ziel.date != today){
//     const stmt = db.prepare('UPDATE ziele set achieved = ?, done = ?, date = ? WHERE id = ?')
//     stmt.run(0, 0, today, ziel.id)
//   }
//  })
//  const stmtnew = db.prepare('SELECT * FROM ziele')
//  const aktuelleZiele = stmtnew.all()
//  const aktuellePersönlicheZiele = aktuelleZiele.filter((ziel) => {if(ziel.userId == userId){return ziel} } )
//  const persönlicheZiele = ziele.filter((ziel) => {if(ziel.userId == userId){return ziel} })
})

app.post('/daily-tracker/:userId', async (req,res) => {
  const {titel} = req.body
  const {goal} = req.body
  const {date} = req.body
  const today = dayjs().format('YYYY-MM-DD')
  const {userId} = req.params

  if(!titel || !goal){
    return res.status(400).json({message: 'Titel und Goal angeben!'})
  }

  await db.query('INSERT INTO ziele (titel, goal, date, "userId") VALUES ($1, $2, $3, $4)', [titel, goal,today,userId])

  res.json({message: 'Goal successfully added'})
})

app.delete('/daily-tracker/:id/:userId', async (req, res) => {
  const {id} = req.params
 
  await db.query('DELETE FROM ziele WHERE id = $1', [id])

  res.json({message: 'goal deleted'})
})

app.patch('/daily-tracker/:id/:userId', async (req, res) => {
  const {id} = req.params
  const {achieved} = req.body

  let fertig = false
  let titel = ''

  await db.query('UPDATE ziele SET achieved = $1 WHERE id = $2', [achieved,id])

  const result = await db.query('SELECT * FROM ziele WHERE id = $1',[id])
  const ziel = result.rows[0]
  
  
  if(ziel.achieved >= ziel.goal){
    titel = ziel.titel
    fertig = true
    await db.query('UPDATE ziele SET done = $1 WHERE id =$2',[1, ziel.id])
    // stmtDone.run(1, ziel.id)
  }

  if(fertig) {
    return res.json({message: `goal updated, ${titel} finished`})
  }

  res.json({message: 'goal updated'})
})

app.post('/register', async (req,res) => {
  const {name} = req.body
  let {password} = req.body

  if (!name || !password) {
  return res.status(400).json({ error: 'Username and / or Password missing' })
  }

  const userCheck = await db.query('SELECT * FROM users WHERE name = $1', [name]);

  if (userCheck.rows.length > 0) {
        return res.status(400).json({ error: 'User already exists' });
    }

  // const result = await db.query('SELECT * FROM users')
  // const users = result.rows

  // users.forEach((user) => {
  //   if(user.name == name) {
  //     return res.status(400).json({error: 'User already exists'})
  //   }
  // })

    password = await bcrypt.hash(password, 10)
    await db.query('INSERT INTO users (name, passwort) VALUES ($1,$2)', [name, password])

    // stmt.run(name, password)
    
    res.json({message: 'User added'})
})

app.post('/login',async (req,res) => {
  const {name} = req.body
  const {password} = req.body

  const result = await db.query('SELECT * FROM users WHERE name = $1', [name])
  const user = result.rows[0]

  if (!user) {
  return res.status(401).json({ error: 'User not found' })
}

  if(await bcrypt.compare(password, user.passwort)){
    res.json({userId: user.id})
  } else{return res.status(401).json({ error: 'Wrong password' })}
})

// app.post('/daily-reset', async (req, res) => {
//   try {
//     await saveToHistory()
    
//     console.log("Mitternachts-Reset erfolgreich ausgeführt!");
//     res.status(200).json({ success: true, message: "Reset durchgeführt" });
//   } catch (error) {
//     console.error("Fehler beim Reset:", error);
//     res.status(500).json({ error: "Reset fehlgeschlagen" });
//   }
// });

// async function saveToHistory() {
//   const result = await db.query('SELECT * FROM ziele')
//   const ziele = result.rows
//   const date = dayjs().format('YYYY-MM-DD')
  
//   for(const ziel of ziele) {

//     const uId = ziel.userid || ziel.userId

//     await db.query('INSERT INTO history (titel, goal, date, "userId", achieved, done) VALUES ($1, $2, $3, $4, $5, $6)', [ziel.titel,ziel.goal,date,uId,ziel.achieved,ziel.done])
//   } 
  // ziele.forEach((ziel) => {
  //   const stmt = db.prepare('INSERT INTO history (titel, goal, date, userId, achieved, done) VALUES (?, ?, ?, ?, ?, ?) ')

  //   stmt.run(ziel.titel,ziel.goal,date,ziel.userId,ziel.achieved,ziel.done)
  // })

  // await db.query('UPDATE ziele SET achieved = $1, done = $2, date = $3', [0,0,date])
  // resetStmt.run(0,0,date)
// }

app.post('/daily-reset', (req, res) => {
  // 1. Dem Wecker SOFORT antworten (Status 200), damit cron-job.org nach 1 Sekunde fertig ist
  res.status(200).json({ success: true, message: "Reset im Hintergrund gestartet" });

  // 2. Danach den Reset im Hintergrund in aller Ruhe ausführen, während der Server aufwacht
  (async () => {
    try {
      console.log("⏰ Hintergrund-Reset gestartet...");
      await saveToHistory();
      console.log("✅ Mitternachts-Reset erfolgreich im Hintergrund ausgeführt!");
    } catch (error) {
      console.error("❌ Fehler beim Hintergrund-Reset:", error);
    }
  })();
});

async function saveToHistory() {
  const result = await db.query('SELECT * FROM ziele');
  const ziele = result.rows;
  const date = dayjs().format('YYYY-MM-DD');
  
  for (const ziel of ziele) {
    // Falls Postgres die Spalte kleingeschrieben hat, fangen wir beides ab:
    const uId = ziel.userid || ziel.userId;

    // WICHTIG: Prüfe in deiner DB, ob die Spalte in der History-Tabelle "userId" oder userid heißt!
    // Wenn sie kleingeschrieben ist, entferne die Anführungszeichen bei "userId"
    await db.query(
      'INSERT INTO history (titel, goal, date, "userId", achieved, done) VALUES ($1, $2, $3, $4, $5, $6)', 
      [ziel.titel, ziel.goal, date, uId, ziel.achieved, ziel.done]
    );
  } 

  // Setzt alle Ziele auf 0 zurück
  await db.query('UPDATE ziele SET achieved = $1, done = $2, date = $3', [0, 0, date]);
}

app.listen(PORT, (req, res) => {
  console.log(`Server läuft auf http://localhost:${PORT}`)
} )

// nodeCron.schedule('0 0 * * *', async () => {
//   console.log('⏰ Cron-Job gestartet: Sichele Ziele und setze zurück...')
//   await saveToHistory()
//   console.log('✅ Cron-Job erfolgreich beendet!');
// })















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
