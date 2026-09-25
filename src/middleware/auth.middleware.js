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

async function authSystemUserMiddleware(req, res, next) {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            message: "Unauthorized access, token is missing"
        })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await userModel.findById(decoded.userId).select("+systemUser");
        if (!user.systemUser) {
            return res.status(403).json({
                message: "Forbidden access, not a system user"
            })
        }

        req.user = user;

        return next();
    }
    catch (err) {
        return res.status(401).json({
            message: "Unauthorized access, token is invalid"
        })
    }

}

module.exports = {
    authMiddleware,
    authSystemUserMiddleware
}