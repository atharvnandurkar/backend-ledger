const transactionModel = require('../models/transaction.model');
const ledgerModel = require('../models/ledger.model');
const accountModel = require('../models/account.model');
const emailService = require('../services/email.service');
const mongoose = require("mongoose");

/**
 * - Create a new transaction
 * THE 10-STEP TRANSFER FLOW: 
    * 1. Validate request
    * 2. Validate idempotency key
    * 3. Check account status
    * 4. Derive sender balance from ledger
    * 5. Create transaction (PENDING)
    * 6. Create DEBIT ledger entry
    * 7. Create CREDIT ledger entry
    * 8. Mark transaction COMPLETED
    * 9. Commit MongoDB Session
    * 10. Send email notification  
 */

async function createTransaction(req, res) {


    /**
     * 1. Validate request
     */
    const { fromAccount, toAccount, amount, idempotencyKey } = req.body;

    if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({
            message: "FromAccount, toAccount, amount and idempotencyKey are required"
        })
    }

    // Check is account is Exist OR Not.
    const fromUserAccount = await accountModel.findOne({
        _id: fromAccount,
    })

    const toUserAccount = await accountModel.findOne({
        _id: toAccount,
    })

    if (!fromUserAccount || !toUserAccount) {
        return res.status(400).json({
            message: "invalid fromAccount or toAccount"
        })
    }

    /**
     * 2. Validate idempotency Key
     */
    const isTransactionAlreadyExists = await transactionModel.findOne({
        idempotencyKey: idempotencyKey
    })

    if (isTransactionAlreadyExists) {
        if (isTransactionAlreadyExists.status === "COMPLETED") {
            return res.status(200).json({
                message: "Transaction already processed",
                transaction: isTransactionAlreadyExists
            })
        }

        if (isTransactionAlreadyExists.status === "PENDING") {
            return res.status(200).json({
                message: "Transaction is still processing"
            })
        }

        if (isTransactionAlreadyExists.status === "FAILED") {
            return res.status(500).json({
                message: "Transaction processing failed, please retry"
            })
        }

        if (isTransactionAlreadyExists === "REVERSED") {
            return res.status(500).json({
                message: "Transaction was reversed, please retry"
            })
        }
    }


    /**
     * 3. Check account status
     */
    if (fromUserAccount.status !== "ACTIVE" || toUserAccount.status !== "ACTIVE") {
        return res.status(400).json({
            message: "Both fromAccount and toAccount must be ACTIVE to process transaction"
        })
    }


    /**
     * 4.Derive sender balance from ledger
     * - Need to check the balance of the sender.
     * - aggregation pipeline.
     */
    const balance = await fromUserAccount.getBalance();

    if (balance < amount) {
        res.status(400).json({
            message: `Insufficient balance. Current balance is ${balance}. Requested amount is ${amount}`
        })
    }


    /**
     * 5. Create transaction (PENDING)
     * - 5, 6, 7, 8 steps is need to be completely succeed or nothing at all.
    // - For this mongoDB give: startTransaction();
     */
    const session = await mongoose.startSession();
    session.startTransaction();

    // Create transaction
    const transaction = await transactionModel.create({
        fromAccount,
        toAccount,
        amount,
        idempotencyKey,
        status: "PENDING"
    }, { session })  // need to pass 2nd parameter i.e. session.


    // 6. Create DEBIT ledger entry
    const debitLedgerEntry = await ledgerModel.create({
        account: fromAccount,
        amount: amount,
        transaction: transaction._id,
        type: "DEBIT"
    }, { session })

    // 7. Create CREDIT ledger entry
    const creditLedgerEntry = await ledgerModel.create({
        account: toAccount,
        amount: amount,
        transaction: transaction._id,
        type: "CREDIT"
    }, { session })

    // 8. Mark transaction COMPLETED
    transaction.status = "COMPLETED"
    await transaction.save({ session });

    // 9. Commit MongoDB Session
    await session.commitTransaction();
    session.endSession();

    /**
     * 10. Send Email notification
     */
    await emailService.sendTransactionEmail(req.user.email, req.user.name, amount, toAccount);

    return res.status(201).json({
        message: "Transaction completed successfully",
        transaction: transaction
    })
}




async function createInitialFundsTransaction(req, res) {
    const { toAccount, amount, idempotencyKey } = req.body

    if (!toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({
            message: "toAccount, amount and idempotencyKey are required"
        })
    }

    const toUserAccount = await accountModel.findOne({
        _id: toAccount,
    })

    if (!toUserAccount) {
        return res.status(400).json({
            message: "Invalid toAccount"
        })
    }

    const fromUserAccount = await accountModel.findOne({
        user: req.user._id
    })

    if (!fromUserAccount) {
        return res.status(400).json({
            message: "System user account not found"
        })
    }


    const session = await mongoose.startSession()
    session.startTransaction()

    const transaction = new transactionModel({
        fromAccount: fromUserAccount._id,
        toAccount,
        amount,
        idempotencyKey,
        status: "PENDING"
    })

    const debitLedgerEntry = await ledgerModel.create([{
        account: fromUserAccount._id,
        amount: amount,
        transaction: transaction._id,
        type: "DEBIT"
    }], { session })

    const creditLedgerEntry = await ledgerModel.create([{
        account: toAccount,
        amount: amount,
        transaction: transaction._id,
        type: "CREDIT"
    }], { session })

    transaction.status = "COMPLETED"
    await transaction.save({ session })

    await session.commitTransaction()
    session.endSession()

    return res.status(201).json({
        message: "Initial funds transaction completed successfully",
        transaction: transaction
    })


}


module.exports = {
    createTransaction,
    createInitialFundsTransaction
};