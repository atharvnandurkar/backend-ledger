//Task: 1) server ke instance ko create karna.
// 2) server ko config karna. i.e. konse middleware config.,which type of APIs.

const express = require('express');
const app = express();  // creating server instance.

app.get("/", (req, res) => {
    res.send("Hi");
})

module.exports = app;
