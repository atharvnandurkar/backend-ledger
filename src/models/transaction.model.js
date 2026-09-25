const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({

    fromAccount: {
        type: mongoose.Schema.Types.ObjectId,
        // const accountModel = mongoose.model("account", accountSchema);
        ref: "account",  // reference to the account Model.
        required: [true, "Transaction must be associated with a from account"],
        index: true
    },

    toAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "account",
        required: [true, "Transaction must be associated with a to account"],
        index: true
    },
    status: {
        type: String,
        enum: {
            values: ["PENDING", "COMPLETED", "FAILED", "REVERSED"],
            message: "Status can be either PENDING, COMPLETED, FAILER or REVERSED",
        },
        default: "PENDING"
    },
    amount: {
        type: Number,
        required: [true, "Amount is required for creating a transaction"],
        min: [0, "Transaction amount cannt be negative"]
    },
    // Key helps to prevent 2 transaction for the same payment.
    // Generates on client side not on backend side. It is unique for each transaction.
    idempotencyKey: {
        type: String,
        required: [true, "idempotency Key is required for creating a transaction"],
        index: true,
        unique: true
    },
}, {
    timestamps: true
});

const transactionModel = mongoose.model("transaction", transactionSchema);

module.exports = transactionModel;