const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: [true, "Account must be associated with a user"],
            // For fast searching of user.
            index: true
        },
        status: {
            enum: {
                values: ["ACTIVE", "FROZEN", "CLOSED"],
                message: "Status can be either ACTIVE, FROZEN or CLOSED"
            },
            currency: {
                type: String,
                required: [true, "Currency is required for creating an account"],
                default: "INR"
            }
        }
    },
    {
        timestamps: true
    }
);

// Create compound index on user and status. 
// For Finding purpose.
accountSchema.index({user:1, status:1});

const accountModel = mongoose.model("account", accountSchema);

module.exports = accountModel;