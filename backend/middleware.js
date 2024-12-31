const jwt = require("jsonwebtoken");
const JWT_TOKEN = require("./config");

const authenticationMiddleware = (req, res, next) => {

    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith("bearer")) {
        return res.status(403).json({
            message: "Authorization required"
        })
    }

    const token = authorization.split(' ')[1];
    const decoded = jwt.verify(token, JWT_TOKEN)

    if (decoded.userId) {
        req.userId = decoded.userId
        next()
    } else {
        return res.status(403).json({
            message: "User does not exist!"
        })
    }
}

module.exports = {
    authenticationMiddleware
}