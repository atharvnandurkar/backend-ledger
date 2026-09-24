// Authentication routes.

const express = require('express');
const authController = require("../controllers/auth.controller");

const router = express.Router();

/* POST /api/auth/register */
// router.post("/register", (req, res) => {})
router.post("/register", authController.userRegisterController)

module.exports = router;
