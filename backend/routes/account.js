const express = require("express");
const { authenticationMiddleware } = require("../middleware");
const { Account } = require("../db");
const { default: mongoose } = require("mongoose");

const router = express.Router();

router.use(express.json());

router.get("/balance", authenticationMiddleware, async (req, res) => {

    const account = await Account.findOne({
        userId: req.userId
    })

    return res.json({
        balance: account.balance
    })
})

router.post("/transfer", authenticationMiddleware, async (req, res) => {

    const session = await mongoose.startSession();

    session.startTransaction();

    const { amount, to } = req.body;

    const account = await Account.findOne({
        userId: req.userId
    }).session(session);

    if (!account || account.balance < amount) {
        await session.abortTransaction();
        return res.status(400).json({
            message: "Insufficient balance in account"
        })
    }
    const toAccount = await Account.findOne({
        userId: to
    }).session(session)

    if (!toAccount) {
        await session.abortTransaction();
        return res.status(400).json({
            message: "user does not exists"
        })
    }

    await Account.updateOne({ userId: req.userId }, { $inc: { balance: -amount } }).session(session);
    await Account.updateOne({ userId: to }, { $inc: { balance: amount } }).session(session);

    await session.commitTransaction();

    res.json({
        message: "transactions done successfully"
    })

})


module.exports = router