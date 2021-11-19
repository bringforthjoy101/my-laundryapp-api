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
                const { amount, services, clientId } = orders[i];
                const insertData = { orderNumber: generateOrderId(), amount, services, clientId, userId: req.user.id, businessId: req.user.business.id };
                const createdOrder = await DB.orders.create(insertData);
                if (createdOrder) {
                    successArr.push({successMsg: `Order placed successfully!`});
                } else {
                    errorArr.push({successMsg: `An error occured`, data: orders[i]});
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
            const { amount, services, clientId, subTotal, tax, discount, shipping } = req.body;
            if (!req.user.business) return errorResponse(res, `Please create a business!`);
            const userId = req.user.id;
            const businessId = req.user.business.id;
            
            const insertData = { orderNumber: generateOrderId(), amount, services, subTotal, tax, discount, shipping, clientId, userId, businessId };
            await DB.orders.create(insertData);
            return successResponse(res, `Order placed successfully!`);
        }
        catch(error){
            console.log(error);
            return errorResponse(res, `An error occured:- ${error.message}`);
        }
}

const updateOrder = async (req, res, next) => {
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ errors: errors.array() });

        const { status } = req.body;
        const {id} = req.params;
        const order = await DB.orders.findOne({ where: {id} });
        if (!order)
                return errorResponse(res, `order with ID ${id} not found!`);
        const updateData = { 
            status: status ? status : order.status
        };
        await order.update(updateData);
        return successResponse(res, `Service updated successfully!`);
    }
    catch(error){
        console.log(error)
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
                { model: DB.clients , attributes: ['names']},
                { model: DB.users, attributes: ['firstName', 'lastName'] }
            ], order: [ ['id', 'DESC'] ]
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

        const {id} = req.params;
        const order = await DB.orders.findOne({ 
            where: { id }, 
            include: [
                { model: DB.clients , attributes: ['names', 'phone', 'location']},
                { model: DB.users, attributes: ['firstName', 'lastName'] },
                { model: DB.businesses }
            ] 
        });
        
        if(!order)
            return errorResponse(res, `Order with ID ${id} not found!`);
        return successResponse(res, `Order details retrived!`, order);
    }
    catch(error){
        return errorResponse(res, `An error occured:- ${error.message}`);
    }
}

module.exports = { getOrderDetail, createMultipleOrders, createOrder, updateOrder, getOrders }