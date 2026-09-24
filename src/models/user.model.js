const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    email: {
        type:String,
        required:[true, "Email is required for creating a user"],
        trim: true,
        lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'],
        unique: [true]
    },
    name: {
        type: String,
        required: [true, "Name is required for creating an account"],
    },
    password: {
        type: String,
        required: [true, "Password is required for creating an account"],
        minlength: [6, "password should contain more than 6 character"],
        select: false
    },
    timestamps: true
})

userSchema.pre("save", async function (next) {
    // Password hashing.

})