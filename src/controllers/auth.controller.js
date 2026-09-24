const userModel = require("../models/user.model");
const jwt = require('jsonwebtoken');

/** 
* - user register controller
* - POST /api/auth/register
*/
async function userRegisterController(req, res) {
    const { email, password, name } = req.body;

    const isExist = await userModel.findOne({
        email: email
    })

    if (isExist) {
        return res.status(422).json({
            message: "User already exists with email",
            status: "failed"
        })
    }

    const user = await userModel.create({
        email, password, name
    })

    // Generate the jwt token
    // Create the token for the user.
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "3d" });

    // Save the token into cookie.
    res.cookie("token", token)

    // Rest-API principle.
    // if in endpoint or in API we are creating the resource on user Request then the status code will should go 201.
    res.status(201).json({
        user: {
            id: user._id,
            email: user.email,
            name: user.name
        },
        token
    })
}

/**
 * User Login Controller
 * POST /api/auth/login
 */
async function userLoginController(req, res) {
    const {email, password} = req.body;

    const user = await userModel.findOne({ email }).select("+password");

    if(!user) {
        return res.status(401).json({
            message: "Email or password is INVALID"
        })
    }

    const isValidPassword = await user.comparePassword(password);

    if(!isValidPassword) {
        return res.status(401).json({
            message: "Email or password is INVALID"
        })
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "3d" });

    res.cookie("token", token)

    res.status(200).json({
        user: {
            id: user._id,
            email: user.email,
            name: user.name
        },
        token
    })
}

module.exports = {
    userRegisterController,
    userLoginController
}