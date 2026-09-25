//Task: 1) server ke instance ko create karna.
// 2) server ko config karna. i.e. konse middleware config.,which type of APIs.

const express = require('express');
const cookieParser = require("cookie-parser");

const app = express();  // creating server instance.

// Express server cant read req.body data by default.
app.use(express.json());
app.use(cookieParser());


/**
 * - Routes required
 */
const authRouter = require("./routes/auth.routes");  // Accessing the authRoutes.
const accountRouter = require("./routes/account.routes");
const transactionRouter = require('./routes/transaction.routes');

/**
 * - Use Routes
 */
app.use("/api/auth", authRouter);
app.use("/api/accounts", accountRouter);
app.use("/api/transactions", transactionRouter);

module.exports = app;