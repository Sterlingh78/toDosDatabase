const mongoose = require('mongoose')

const toDoSchema = new mongoose.Schema({
    category: String,
    toDoList: [{ name: String, done: Boolean}]
})

module.exports = mongoose.model('toDo', toDoSchema)