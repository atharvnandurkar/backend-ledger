const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = mongoose.Schema(
    {
        email: {
            type: String,
            required: [true, "Email is required for creating a user"],
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
    },
    {
        timestamps: true
    }
)

userSchema.pre("save", async function () {

    if (!this.isModified("password")) {
        return;
    }

    // Password hashing.

    // Created password to hash. 
    const hash = await bcrypt.hash(this.password, 10);
    // Save the hash password into the password.
    this.password = hash;

    return;
})


// Compare the hash Password to the hash that saved in the DB.
userSchema.methods.comparePassword = async function (password) {

    return await bcrypt.compare(password, this.password);

}

const userModel = mongoose.model("user", userSchema);

module.exports = userModel;
