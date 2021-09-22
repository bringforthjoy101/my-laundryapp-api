// IMPORT DATABASE FILE
const DB = require('./db');
const { validationResult } = require('express-validator');
const {successResponse, errorResponse, generateOrderId} = require('../helpers/utility');
const { updateWallet } = require('../helpers/wallet');


/**
 * CREATE MULtiPLE ORDERS
 * @param {orders array containing order objects} req 
 * @param {*} res 
 * @param {*} next 
 */

const createMultipleOrders= async (req, res, next) => {

        try{
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { orders } = req.body;
            let errorArr = [];
            let successArr = [];

            for(let i=0;i<orders.length;i++){
                const { amount, products, studentId } = orders[i];
                const transactionId = new Date().getTime();
                const walletData = {
                    studentId,
                    transactionId,
                    amount,
                    type: 'debit'
                }
                const logTransaction = await updateWallet(walletData);
                if (logTransaction.status) {
                    const insertData = { orderNumber: generateOrderId(), amount, products, studentId, admin: req.admin.id };
                    await DB.orders.create(insertData);
                    successArr.push({successMsg: `Order placed successfully!`});
                } else {
                    errorArr.push({successMsg: logTransaction.message, data: orders[i]});
                }
                
            }
            return successResponse(res, `Operation completed!`, {success:successArr.length, successData:successArr, failure:errorArr.length, failureData:errorArr});
        }
        catch(error){
            console.log(error);
            return errorResponse(res, `An error occured:- ${error.message}`);
        }
}


/**
 * CREATE SINGLE ORDER
 * @param {order object} req 
 * @param {*} res 
 * @param {*} next 
 */

const createOrder= async (req, res, next) => {
        try{
            const errors = validationResult(req);
            if (!errors.isEmpty())
                return res.status(400).json({ errors: errors.array() });
            const { amount, products, studentId, } = req.body;
            const transactionId = new Date().getTime();
            const walletData = {
                studentId,
                transactionId,
                amount,
                type: 'debit'
            }
            const logTransaction = await updateWallet(walletData);
            if(!logTransaction.status)
                return errorResponse(res, `An error occured:- ${logTransaction.message}`);
            const insertData = { orderNumber: generateOrderId(), transactionId: logTransaction.id, amount, products, studentId, adminId: req.admin.id }
            await DB.orders.create(insertData);
            products.forEach(async product => {
                const item = await DB.products.findOne({ where: {id: product.id}});
                console.log(product.qty, item.qty)
                await item.update({qty: Number(item.qty) - Number(product.qty)});
            })
            return successResponse(res, `Order placed successfully!`);
            
        }
        catch(error){
            console.log(error);
            return errorResponse(res, `An error occured:- ${error.message}`);
        }
}

/**
 * GET ORDERS FROM DATABASE, CALLED FROM ORDERS LISTING PAGE
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */

const getOrders = async (req, res, next) => {
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ errors: errors.array() });
        const orders = await DB.orders.findAll({
            include: [
                { model: DB.students, attributes: ['firstName', 'lastName'] },
                { model: DB.admins, attributes: ['firstName', 'lastName'] }
            ]
        });

        if(!orders.length)
            return successResponse(res, `No order available!`, []);
        return successResponse(res, `${orders.length} order${orders.length>1 ? 's' : ''} retrived!`, orders);
    }
    catch(error){
        console.log(error.message);
        return errorResponse(res, `An error occured:- ${error.message}`);
    }
}

/**
 * GET ORDER DETAIL FROM DATABASE
 * @param {orderId} req 
 * @param {*} res 
 */

const getOrderDetail = async(req,res) => {
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ errors: errors.array() });

        const {orderId} = req.body;
        const order = await DB.orders.findOne({ 
            where: { id: orderId }, 
            include: [
                { model: DB.students, attributes: ['firstName', 'lastName', 'avatar'] },
                { model: DB.admins, attributes: ['firstName', 'lastName'] }
            ] 
        });
        
        if(!order)
            return errorResponse(res, `Order with ID ${orderId} not found!`);
        return successResponse(res, `Order details retrived!`, order);
    }
    catch(error){
        return errorResponse(res, `An error occured:- ${error.message}`);
    }
}

module.exports = { getOrderDetail, createMultipleOrders, createOrder, getOrders }