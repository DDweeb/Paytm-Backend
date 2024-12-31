const express = require("express");
const { signupSchema, signinSchema, updateSchema } = require("./zod");
const { Users, Account } = require("../db");
const jwt = require("jsonwebtoken");
const JWT_TOKEN = require("../config");
const { authenticationMiddleware } = require("../middleware");

const router = express.Router();
router.use(express.json())

router.post("/signup", async (req, res) => {

    const body = req.body;
    const { success } = signupSchema.safeParse(req.body);

    if (!success) {
        return res.status(411).json({
            message: "Invalid inputs"
        })
    }

    const existingUser = await Users.findOne({
        username: body.username
    })

    if (existingUser) {
        return res.status(411).json({
            message: "User exists already"
        })
    }

    const User = await Users.create(body);
    const userId = User._id;

    await Account.create({
        userId: userId,
        balance: 1 + Math.random() * 10000
    })

    const token = jwt.sign({
        userId
    }, JWT_TOKEN)

    res.json({
        message: "User created successfully",
        token: token
    })
})

router.post("/signin", async (req, res) => {
    const body = req.body;
    const { success } = signinSchema.safeParse(body);

    if (!success) {
        res.status(411).json({
            message: "You sent the wrong inputs"
        })
    }

    const userExists = await Users.findOne({
        username: body.username
    })

    if (!userExists) {
        return res.json({
            message: "User does not exists"
        })
    }
    const userId = userExists._id;

    const token = jwt.sign({
        userId
    }, JWT_TOKEN)


    res.json({
        token: token
    })
})

router.put("/update", authenticationMiddleware, async (req, res) => {
    const body = req.body;
    const { success } = updateSchema.safeParse(body);

    if (!success) {
        return res.status(411).json({
            message: "Cant update the inputs "
        })
    }

    await Users.updateOne(req.body, {
        id: req.userId
    })

    res.json({
        message: "Info updated successfully"
    })
})

router.get("/bulk", async (req, res) => {
    const filter = req.query.filter || "";

    const users = await Users.find({
        $or: [{
            firstname: {
                "$regex": filter, $options: "i"
            }
        }, {
            lastname: {
                "$regex": filter, $options: "i"
            }
        }]
    })

    res.json({
        user: users.map((user) => ({
            username: user.username,
            firstname: user.firstname,
            lastname: user.lastname,
            _id: user._id
        }))
    })
})

module.exports = router; 