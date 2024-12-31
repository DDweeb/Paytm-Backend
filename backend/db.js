const mongoose = require("mongoose")

mongoose.connect("mongodb+srv://Vidhi:podWPDw1nQPSAvzT@cluster0.qgv68.mongodb.net/")

const UserSchema = new mongoose.Schema({
    username: String,
    firstname: String,
    lastname: String,
    password: String

})

const accountSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    },
    balance: {
        type: Number,
        required: true
    }
})

const Users = mongoose.model('Users', UserSchema)
const Account = mongoose.model('Account', accountSchema)

module.exports = {
    Users: Users,
    Account: Account
}