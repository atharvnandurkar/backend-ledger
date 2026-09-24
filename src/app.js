//Task: 1) server ke instance ko create karna.
// 2) server ko config karna. i.e. konse middleware config.,which type of APIs.

const express = require('express');
const cookieParser = require("cookie-parser");

const app = express();  // creating server instance.

// Express server cant read req.body data by default.
app.use(express.json());
app.use(cookieParser());

const authRouter = require("./routes/auth.routes");  // Accessing the authRoutes.

app.use("/api/auth", authRouter);

module.exports = app;
