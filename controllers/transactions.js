// IMPORT DATABASE FILE
const DB = require('./db');
const { validationResult } = require('express-validator');
const {successResponse, errorResponse} = require('../helpers/utility');
const { updateWallet } = require('../helpers/wallet');

/**
 * GET TRANSACTIONS FROM DATABASE, CALLED FROM TRANSACTIONS LISTING PAGE
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */

const getTransactions = async (req, res, next) => {
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ errors: errors.array() });
        const transactions = await DB.transactions.findAll({
            include: [
                { model: DB.students, attributes: ['firstName', 'lastName', 'avatar'] }
            ]
        });

        if(!transactions.length)
            return successResponse(res, `No transaction available!`, []);
        return successResponse(res, `${transactions.length} transaction${transactions.length>1 ? 's' : ''} retrived!`, transactions);
    }
    catch(error){
        console.log(error.message);
        return errorResponse(res, `An error occured:- ${error.message}`);
    }
}

/**
 * GET ORDER DETAIL FROM DATABASE
 * @param {transactionId} req 
 * @param {*} res 
 */

const getTransactionDetail = async(req,res) => {
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ errors: errors.array() });

        const {transactionId} = req.body;
        const transaction = await DB.transactions.findOne({ 
            where: { id: transactionId }, 
            include: [
                { model: DB.students, attributes: ['fisrtName', 'lastName', 'avatar'] }
            ] 
        });
        
        if(!transaction)
            return errorResponse(res, `Transaction with ID ${transactionId} not found!`);
        return successResponse(res, `Transaction details retrived!`, transaction);
    }
    catch(error){
        return errorResponse(res, `An error occured:- ${error.message}`);
    }
}

module.exports = { getTransactionDetail, getTransactions }