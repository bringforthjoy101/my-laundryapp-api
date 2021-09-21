// IMPORT DATABASE FILE
const DB = require('./db');
const { validationResult } = require('express-validator');
const {successResponse, errorResponse} = require('../helpers/utility');
const config = require('../../config');


/**
 * CREATE SINGLE PRODUCT
 * @param {product object} req 
 * @param {*} res 
 * @param {*} next 
 */

const stockUp = async (req, res, next) => {
        try{
            const errors = validationResult(req);
            if (!errors.isEmpty())
                return res.status(400).json({ errors: errors.array() });
            const { productId, qty, price } = req.body;
            const product = await DB.products.findOne({ where: { id: productId } });
            if (!product)
                return errorResponse(res, `Product with ID ${productId} not found!`);
            const insertData = { productId, qty, price, oldPrice: product.price, adminId: req.admin.id };
            await DB.stocks.create(insertData);
            await DB.stocks.update({status: 'expired'})
            const result = await product.update({ qty: Number(product.qty) + Number(qty), price});
            if (result)
                return successResponse(res, `Product ${product.name} successfully stocked up with ${qty} quantity at ${config.STORE_CURRENCY} ${price.toLocaleString()} !`);
        }
        catch(error){
            console.log(error);
            return errorResponse(res, `An error occured:- ${error.message}`);
        }
}

/**
 * GET PRODUCTS FROM DATABASE, CALLED FROM PRODUCTS LISTING PAGE
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */

const allStocks = async (req, res, next) => {
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ errors: errors.array() });
        const stocks = await DB.stocks.findAll();

        if(!stocks.length)
            return successResponse(res, `No stock available!`, []);
        return successResponse(res, `${stocks.length} stock${stocks.length>1 ? 's' : ''} retrived!`, stocks);
    }
    catch(error){
        console.log(error.message);
        return errorResponse(res, `An error occured:- ${error.message}`);
    }
}

/**
 * GET STOCK DETAIL FROM DATABASE
 * @param {productId} req 
 * @param {*} res 
 */

const getStockDetail = async(req,res) => {
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ errors: errors.array() });

        const {stockId} = req.body;
        const stock = await DB.stocks.findOne({ where: { id: stockId }, include: { model: DB.stocks, attributes: { exclude: ['createdAt', 'updatedAt'] } } });
        
        if(!stock === null)
            return errorResponse(res, `Stock with ID ${stockId} not found!`);
        return successResponse(res, `Stock details retrived!`, stock);
    }
    catch(error){
        return errorResponse(res, `An error occured:- ${error.message}`);
    }
}


/**
 * PHYSICALLY DELETE SINGLE PRODUCT FROM DATABASE
 * @param {productId} req 
 * @param {*} res 
 */

const deleteStock = async (req,res) => { 
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ errors: errors.array() });
        
        const {stockId} = req.body;
        // check if stock exists
        const checkStock = await DB.stocks.findOne({ where: { id: stockId } }); 
        if (!checkStock)
            return errorResponse(res, `Stock with ID ${stockId} not found!`);
        // check if stock is expired
        if (checkStock.status === 'expired')
            return errorResponse(res, `Stock expired!`);
        
        // get product and update it with previous qty and price
        const product = await DB.findOne({ where: { id: checkStock.productId } });
        await product.update({ qty: Number(product.qty) - Number(checkStock.qty), price: checkStock.oldPrice });
        await checkStock.destroy({ force: true }); // delete stock

        // find previous stoick and update its status to running
        const previousStock = await DB.stocks.findOne({ where: { id: stockId }, order: [ [ 'createdAt', 'DESC' ]] });
        await previousStock.update({status: 'running'})
        return successResponse(res, `Stock with ID ${stockId} deleted successfully!`);
    }
    catch(error){
        console.log(error.message);
        return errorResponse(res, `An error occured:- ${error.message}`);
    }
}

/**
 * PHYSICALLY DELETE ALL PRODUCTS FROM DATABASE
 * @param {*} req 
 * @param {*} res 
 */

const deleteAllProducts = async (req,res) => { 
    try{
        await DB.products.destroy({ force: true });
        return successResponse(res, `All products deleted successfully!`);
    }
    catch(error){
        console.log(error.message);
        return errorResponse(res, `An error occured:- ${error.message}`);
    }
}

/**
 * PHYSICALLY DELETE MULTIPLE PRODUCTS FROM DATABASE
 * @param {ids} req 
 * @param {*} res 
 */

const deleteMultipleProducts = async (req,res) => { 
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ errors: errors.array() });

        const {ids} = req.body;
        let errorArr = [];
        let successArr = [];
        for(let i=0;i<ids.length;i++){
            const checkProduct = await DB.products.findOne({ where: { id: ids[i] } })
            if (checkProduct) {
                await checkProduct.destroy()
                successArr.push({successMsg:`Product with ID ${ids[i]} deleted successfully!`})
            } else {
                errorArr.push({errorMsg:`Product with ID ${ids[i]} not found!`});
            }
        }
        return successResponse(res, `Operation successful!`, {success:successArr.length, successData:successArr, failure:errorArr.length, failureData:errorArr});
    }
    catch(error){
        console.log(error.message);
        return errorResponse(res, `An error occured:- ${error.message}`);
    }
}

module.exports = { }