// IMPORT DATABASE FILE
const DB = require('./db');
const { validationResult } = require('express-validator');
const {successResponse, errorResponse} = require('../helpers/utility');
const jwt = require('jsonwebtoken')
const config = require('../config/config');


/**
 * CREATE SINGLE SERVICE
 * @param {business object} req 
 * @param {*} res 
 * @param {*} next 
 */

const createBusiness= async (req, res, next) => {
        try{
            const errors = validationResult(req);
            if (!errors.isEmpty())
                return res.status(400).json({ errors: errors.array() });

            const { id } = req.user;
            const { name, address, phone, logo, email, bankName, accountName, bankAccountNumber } = req.body;
            const insertData = { name, address, phone, logo, email, bankName, accountName, bankAccountNumber, userId: id };

            const business = await DB.businesses.findOne({ where: { name, userId: id } });
            if (business)
                return errorResponse(res, `Business ${name} already exists for you!`);
            const result = await DB.businesses.create(insertData);
            if (result){
                let payload = { 
                    ...req.user,
                    business: result
                };
                const token = jwt.sign(payload, config.JWTSECRET);
                return successResponse(res, `Business ${name} created successfully!`, {token});
            }
                
        }
        catch(error){
            console.log(error);
            return errorResponse(res, `An error occured:- ${error.message}`);
        }
}

/**
 * UPDATE SINGLE SERVICE
 * @param {business object} req 
 * @param {*} res 
 * @param {*} next 
 */

const updateBusiness = async (req, res, next) => {
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ errors: errors.array() });

        const {name, address, phone, logo, email, bankName, accountName, bankAccountNumber, status} = req.body;
        const {id} = req.params;
        const business = await DB.businesses.findOne({ where: {id} });
        if (!business)
                return errorResponse(res, `Business with ID ${id} not found!`);
        const updateData = { 
            name: name ? name : business.name, 
            address: address ? address : business.address,
            phone: phone ? phone : business.phone,
            logo: logo ? logo : business.logo,
            email: email ? email : business.email,
            bankName: bankName ? bankName : business.bankName,
            accountName: accountName ? accountName : business.accountName,
            bankAccountNumber: bankAccountNumber ? bankAccountNumber : business.bankAccountNumber,
            status: status ? status : business.status
        };
        await business.update(updateData);
        return successResponse(res, `Business updated successfully!`);
    }
    catch(error){
        console.log(error)
        return errorResponse(res, `An error occured:- ${error.message}`);
    }
}

/**
 * GET BUSINESSES FROM DATABASE, CALLED FROM BUSINESSES LISTING PAGE
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */

const getMyBusiness = async (req, res, next) => {
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ errors: errors.array() });
        const where = { userId: req.user.id };
        const businesses = await DB.businesses.findOne({ where });

        if(!businesses)
            return successResponse(res, `No business available! Please create one`, null);
        return successResponse(res, `Business retrived!`, businesses);
    }
    catch(error){
        console.log(error.message);
        return errorResponse(res, `An error occured:- ${error.message}`);
    }
}

/**
 * GET SERVICE DETAIL FROM DATABASE
 * @param {businessId} req 
 * @param {*} res 
 */

const getBusinessDetail = async(req,res) => {
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ errors: errors.array() });
        const {id} = req.params;
        const business = await DB.businesses.findOne({ where: { id, userId: req.user.id } });
        
        if(!business)
            return errorResponse(res, `Business with ID ${id} not found!`);
        return successResponse(res, `Business details retrived!`, business);
    }
    catch(error){
        return errorResponse(res, `An error occured:- ${error.message}`);
    }
}


/**
 * PHYSICALLY DELETE SINGLE SERVICE FROM DATABASE
 * @param {businessId} req 
 * @param {*} res 
 */

const deleteBusiness = async (req,res) => { 
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ errors: errors.array() });
        
        const {id} = req.params;
        const checkBusiness = await DB.businesses.findOne({ where: { id, userId: req.user.id } });
        if (!checkBusiness)
            return errorResponse(res, `Business with ID ${id} not found!`);
        await checkBusiness.destroy({ force: true });
        return successResponse(res, `Business with ID ${id} deleted successfully!`);
    }
    catch(error){
        console.log(error.message);
        return errorResponse(res, `An error occured:- ${error.message}`);
    }
}

/**
 * PHYSICALLY DELETE ALL BUSINESSES FROM DATABASE
 * @param {*} req 
 * @param {*} res 
 */

const deleteAllBusinesses = async (req,res) => { 
    try{
        await DB.businesses.destroy({ force: true, where: { userId: req.user.id } });
        return successResponse(res, `All businesses deleted successfully!`);
    }
    catch(error){
        console.log(error.message);
        return errorResponse(res, `An error occured:- ${error.message}`);
    }
}

/**
 * PHYSICALLY DELETE MULTIPLE BUSINESSES FROM DATABASE
 * @param {ids} req 
 * @param {*} res 
 */

const deleteMultipleBusinesses = async (req,res) => { 
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ errors: errors.array() });

        const {ids} = req.body;
        let errorArr = [];
        let successArr = [];
        for(let i=0;i<ids.length;i++){
            const checkBusiness = await DB.businesses.findOne({ where: { id: ids[i], userId: req.user.id } })
            if (checkBusiness) {
                await checkBusiness.destroy()
                successArr.push({successMsg:`Business with ID ${ids[i]} deleted successfully!`})
            } else {
                errorArr.push({errorMsg:`Business with ID ${ids[i]} not found!`});
            }
        }
        return successResponse(res, `Operation successful!`, {success:successArr.length, successData:successArr, failure:errorArr.length, failureData:errorArr});
    }
    catch(error){
        console.log(error.message);
        return errorResponse(res, `An error occured:- ${error.message}`);
    }
}

module.exports = {deleteMultipleBusinesses,deleteAllBusinesses,deleteBusiness,
    getBusinessDetail,createBusiness,updateBusiness,getMyBusiness
}