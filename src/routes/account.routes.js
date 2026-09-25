// For creating the user account endpoint.
const express = require('express');
const authMiddleware = require("../middleware/auth.middleware");
const accountContrroller = require("../controllers/account.controller");

const router = express.Router();


/**
 * - POST /api/accounts/
 * - Create a new account
 * - Protected Route -> means token is needed in cookies or in headers.
 */
router.post("/", authMiddleware.authMiddleware, accountContrroller.createAccountController)

module.exports = router;