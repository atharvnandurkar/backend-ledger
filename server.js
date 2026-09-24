// Server start hoga is file se. 

require('dotenv').config();
const app = require("./src/app");
const connectToDB = require("./src/config/db");

connectToDB();

// Need to connect the server to database.

app.listen(3000, "0.0.0.0", () => {
    console.log("server listening on 3000 port");
})

