const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");

async function authMiddleware(req, res, next) {

    // Here We are checking the token is coming to the cookies or headers OR NOT.
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    // User didn't LogedIn.
    if (!token) {
        return res.status(401).json({
            message: "Unauthorized access, token is missing"
        })
    }

    // If token is get the will verify it.
    try {

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find the user by userId.
        const user = await userModel.findById(decoded.userId);

        // Set to the req.user
        req.user = user;

        // Forward request to the controller.
        return next();

    } catch (err) {

        return res.status(401).json({
            message: "Unauthorized access, token is invalid"
        })
    }
}

module.exports = {
    authMiddleware
}