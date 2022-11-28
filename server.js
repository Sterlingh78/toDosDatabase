require('dotenv').config()

const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const app = express()
const toDo = require('./models/toDo')

app.use(express.static('client'))

app.use(cors({
    origin: '*'
}))
app.use(bodyParser.json() )
app.use(bodyParser.urlencoded({
    extended: true
}))
const port = 8000

mongoose.connect(`mongodb+srv://sterlingh78:${process.env.MONGO_PASS}@cluster0.lfbf0x3.mongodb.net/?retryWrites=true&w=majority`, { useNewUrlParser: true })
const db = mongoose.connection
db.on('error', (error) => console.error(error))
db.once('open', () => console.log('Database Connected'))

let toDos = [/* 
  {
      category: "General",
      toDoList: [
          {
              id: 2756,
              name: "get cards",
              done: false
          },
          {
              id: 1745,
              name: "go to work",
              done: false
          },
          {
              id: 9784,
              name: "play tarkov",
              done: false
          },
      ]
  },
  {
      category: "School",
      toDoList: [
          {
              id: 5678,
              name: "swag",
              done: false
          },
          {
              id: 3462,
              name: "steeeze",
              done: false
          },
          {
              id: 7846,
              name: "cool",
              done: false
          },
      ]
  },*/
]

async function getAllToDos(res) {
    try {
        const toDos = await toDo.find()
        res.json(toDos)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

app.get('/sendToDo', async (req, res) => {
    getAllToDos(res)
})

app.post('/addCategory', async (req, res) => {
    const newCategory = new toDo({
        category: req.body.category,
        toDoList: []
    })
    try {
        await newCategory.save()
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
    getAllToDos(res)
})


app.post('/addToDo', async (req, res) => {


    //query database and the category
    const category = await toDo.findOne({ category: req.body.category })

    
    //then push new todo objects to the todo array.
    category.toDoList.push({
        name: req.body.toDo,
        done: false
    })
    
    //then save
    let newCat = await category.save()

    getAllToDos(res)
})


app.get('/editToDo/:toDoID', async (req, res) => {
    const ID = req.params.toDoID
    const category = await toDo.findOne({ 'toDoList._id': ID })

    for (const toDoItem of category.toDoList) {
        if (ID == toDoItem._id) {
            res.send(JSON.stringify(toDoItem.name))
        }
    }
})

app.put('/editToDo/', async (req, res) => {
    const placeholder = req.body.placeholder
    const value = req.body.value
    console.log(placeholder,value)

    const category = await toDo.findOne({ 'toDoList.name': placeholder })

    for (const toDoItem of category.toDoList) {
        if (toDoItem.name == placeholder) {
            toDoItem.name = value
        }
    }

    let newCat = await category.save()
    console.log(newCat)

    getAllToDos(res)
})
/*
app.delete('/deleteToDo/:toDoID', (req, res) => {
    const ID = req.params.toDoID

    for (i = 0; i < toDos.length; i++) {
        for (const toDo of toDos[i].toDoList) {
            if (toDo.id == ID) {
                toDos[i].toDoList.splice(toDos[i].toDoList.indexOf(toDo), 1)
            }
        }
    }

    res.send(toDos)
})

app.get('/pendingToDo', (req, res) => {
    let counter = 0

    for (i = 0; i < toDos.length; i ++) {
        for (const toDo of toDos[i].toDoList) {
            if (toDo.done == false) {
                counter += 1
            }
        }
    }

    res.send({counter})
})

app.put('/setDone/', (req, res) => {
    const ID = req.body.toDoID

    for (i = 0; i < toDos.length; i++) {
        for (const toDo of toDos[i].toDoList) {
            if (ID == toDo.id) {
                toDo.done = true
            }
        }
    }

    res.send(toDos)
})

app.get('/deleteDoneToDos', (req, res) => {
    for (i = 0; i < toDos.length; i++) {
        j = toDos[i].toDoList.length
        while (j--) {
            if (toDos[i].toDoList[j].done == true) {
                toDos[i].toDoList.splice(toDos[i].toDoList[j], 1)
            }
        } 
    }

    res.send(toDos)
})

app.delete('/deleteCategory/:toDoID', (req, res) => {
    const ID = req.params.toDoID

    for (i = 0; i < toDos.length; i++) {
        if (toDos[i].category == ID) {
            toDos.splice(i, 1)
        }
    }

    res.send(toDos)
})

app.get('/editCategory/:toDoID', (req, res) => {
    const ID = req.params.toDoID

    for (i = 0; i < toDos.length; i++) {
        if (toDos[i].category == ID) {
            res.send(JSON.stringify(toDos[i].category))
        }
    }
})

app.put('/editCategory/', (req, res) => {
    const placeholder = req.body.placeholder
    const value = req.body.value

    for (i = 0; i < toDos.length; i ++) {
        if (toDos[i].category == placeholder) {
            toDos[i].category = value
        } 
    }

    res.send(toDos)
})*/

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})