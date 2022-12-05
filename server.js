require("dotenv").config()

const express = require("express")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const app = express()
const toDo = require("./models/toDo")

app.use(express.static("client"))
app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)
const port = $PORT

mongoose.connect(
  `mongodb+srv://sterlingh78:${process.env.MONGO_PASS}@cluster0.lfbf0x3.mongodb.net/?retryWrites=true&w=majority`,
  { useNewUrlParser: true }
)
const db = mongoose.connection
db.on("error", (error) => console.error(error))
db.once("open", () => console.log("Database Connected"))

async function getAllToDos(res) {
  try {
    const toDos = await toDo.find()
    res.json(toDos)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

app.get("/sendToDo", async (req, res) => {
  getAllToDos(res)
})

app.post("/addCategory", async (req, res) => {
  const newCategory = new toDo({
    category: req.body.category,
    toDoList: [],
  })
  try {
    await newCategory.save()
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
  getAllToDos(res)
})

app.post("/addToDo", async (req, res) => {
  //query database and the category
  const category = await toDo.findOne({ category: req.body.category })

  //then push new todo objects to the todo array.
  category.toDoList.push({
    name: req.body.toDo,
    done: false,
  })

  //then save
  let newCat = await category.save()

  getAllToDos(res)
})

app.get("/editToDo/:toDoID", async (req, res) => {
  const ID = req.params.toDoID
  const category = await toDo.findOne({ "toDoList._id": ID })

  for (const toDoItem of category.toDoList) {
    if (ID == toDoItem._id) {
      res.send(JSON.stringify(toDoItem.name))
    }
  }
})

app.put("/editToDo/", async (req, res) => {
  const placeholder = req.body.placeholder
  const value = req.body.value
  //console.log(placeholder,value)

  const category = await toDo.findOne({ "toDoList.name": placeholder })

  for (const toDoItem of category.toDoList) {
    if (toDoItem.name == placeholder) {
      toDoItem.name = value
    }
  }

  let newCat = await category.save()
  //console.log(newCat)

  getAllToDos(res)
})

app.delete("/deleteToDo/:toDoID", async (req, res) => {
  const ID = req.params.toDoID
  const category = await toDo.findOne({ "toDoList._id": ID })

  for (const toDoItem of category.toDoList) {
    if (ID == toDoItem._id) {
      category.toDoList.splice(category.toDoList.indexOf(toDoItem), 1)
    }
  }

  let newCat = await category.save()
  //console.log(newCat)

  getAllToDos(res)
})

app.get("/pendingToDo", async (req, res) => {
  let counter = 0
  const toDos = await toDo.find()
  //console.log(toDos)

  for (category of toDos) {
    for (toDoItem of category.toDoList) {
      if (toDoItem.done == false) {
        counter += 1
      }
    }
  }

  res.send({ counter })
})

app.put("/setDone/", async (req, res) => {
  const ID = req.body.toDoID
  const category = await toDo.findOne({ "toDoList._id": ID })

  for (const toDoItem of category.toDoList) {
    if (ID == toDoItem._id) {
      toDoItem.done = true
    }
  }

  let newCat = await category.save()
  //console.log(newCat)

  getAllToDos(res)
})

app.get("/deleteDoneToDos", async (req, res) => {
  const toDos = await toDo.find()

  for (const category of toDos) {
    let j = category.toDoList.length

    while (j--) {
      if (category.toDoList[j].done == true) {
        category.toDoList.splice(category.toDoList[j], 1)
      }
    }
    await category.save()
  }

  getAllToDos(res)
})

app.delete("/deleteCategory/:categoryName", async (req, res) => {
  const categoryName = req.params.categoryName

  await toDo
    .deleteOne({ category: categoryName })
    .then(function () {
      console.log("Data deleted")
    })
    .catch(function (error) {
      console.log(error)
    })

  getAllToDos(res)
})

app.get("/editCategory/:categoryName", async (req, res) => {
  const categoryName = req.params.categoryName
  const categoryObj = await toDo.findOne({ category: categoryName })

  res.send(JSON.stringify(categoryObj.category))
})

app.put("/editCategory/", async (req, res) => {
  const placeholder = req.body.placeholder
  const value = req.body.value
  const categoryObj = await toDo.findOne({ category: placeholder })

  categoryObj.category = value
  await categoryObj.save()

  getAllToDos(res)
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
