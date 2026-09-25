/**
 * This controller ask the user to give data for creating the account. 
 * Check the user is Log in or Not.
 */

const accountModel = require("../models/account.model");


// This controller for creating the user account by userId and send in response.
async function createAccountController(req, res) {

    const user = req.user;
    
    const account = await accountModel.create({
        user: user._id
    })

    res.status(201).json({
        account
    })

}

module.exports = {
    createAccountController
}