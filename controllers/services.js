// IMPORT DATABASE FILE
const DB = require('./db');
const { validationResult } = require('express-validator');
const {successResponse, errorResponse} = require('../helpers/utility');
const aws = require('aws-sdk');
const csv = require('fast-csv');
const config = require('../config/config');


/**
 * CREATE MULtiPLE SERVICES
 * @param {services array containing service objects} req 
 * @param {*} res 
 * @param {*} next 
 */

const createMultipleServices= async (req, res, next) => {

        try{
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { services } = req.body;
            const { id, businessId } = req.user;
            let errorArr = [];
            let successArr = [];

            for(let i=0;i<services.length;i++){

                const { name, price } = services[i];
                const insertData = { name, price, businessId , userId: id };
                const service = await DB.services.findOne({ where: { name, businessId } });

                if (!service) {
                    await DB.services.create(insertData);
                    successArr.push({successMsg: `Service ${name} created successfully!`});
                } else {
                    errorArr.push({errorMsg: `Service ${name} already exists!`})
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
 * CREATE SINGLE SERVICE
 * @param {service object} req 
 * @param {*} res 
 * @param {*} next 
 */

const createService= async (req, res, next) => {
        try{
            const errors = validationResult(req);
            if (!errors.isEmpty())
                return res.status(400).json({ errors: errors.array() });
            
            const { name, price } = req.body;
            const { id, business} = req.user;
            if (!business) return errorResponse(res, `Please, create a business!`);
            const insertData = { name, price, businessId: business.id, userId: id };

            const service = await DB.services.findOne({ where: { name, businessId:business.id } });
            if (service)
                return errorResponse(res, `Service ${name} already exists for your business!`);
            const result = await DB.services.create(insertData);
            if (result)
                return successResponse(res, `Service ${name} created successfully!`);
        }
        catch(error){
            console.log(error);
            return errorResponse(res, `An error occured:- ${error.message}`);
        }
}

/**
 * UPDATE SINGLE SERVICE
 * @param {service object} req 
 * @param {*} res 
 * @param {*} next 
 */

const updateService = async (req, res, next) => {
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ errors: errors.array() });

        const {name, price, status} = req.body;
        const {id} = req.params;
        const service = await DB.services.findOne({ where: {id} });
        if (!service)
                return errorResponse(res, `Service with ID ${id} not found!`);
        const updateData = { 
            name: name ? name : service.name, 
            price: price ? price : service.price,
            status: status ? status : service.status
        };
        await service.update(updateData);
        return successResponse(res, `Service updated successfully!`);
    }
    catch(error){
        console.log(error)
        return errorResponse(res, `An error occured:- ${error.message}`);
    }
}

/**
 * GET SERVICES FROM DATABASE, CALLED FROM SERVICES LISTING PAGE
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */

const getServices = async (req, res, next) => {
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ errors: errors.array() });
        const where = { businessId: req.user.business.id };
        const services = await DB.services.findAll({ where, order: [ ['id', 'DESC'] ]});

        if(!services.length)
            return successResponse(res, `No service available!`, []);
        return successResponse(res, `${services.length} service${services.length>1 ? 's' : ''} retrived!`, services);
    }
    catch(error){
        console.log(error.message);
        return errorResponse(res, `An error occured:- ${error.message}`);
    }
}

/**
 * GET SERVICE DETAIL FROM DATABASE
 * @param {serviceId} req 
 * @param {*} res 
 */

const getServiceDetail = async(req,res) => {
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ errors: errors.array() });
        const {id} = req.params;
        const service = await DB.services.findOne({ where: { id } });
        
        if(!service)
            return errorResponse(res, `Service with ID ${id} not found!`);
        return successResponse(res, `Service details retrived!`, service);
    }
    catch(error){
        return errorResponse(res, `An error occured:- ${error.message}`);
    }
}


/**
 * PHYSICALLY DELETE SINGLE SERVICE FROM DATABASE
 * @param {serviceId} req 
 * @param {*} res 
 */

const deleteService = async (req,res) => { 
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ errors: errors.array() });
        
        const {id} = req.params;
        const checkService = await DB.services.findOne({ where: { id, userId: req.user.id } });
        if (!checkService)
            return errorResponse(res, `Service with ID ${id} not found!`);
        await checkService.destroy({ force: true });
        return successResponse(res, `Service with ID ${id} deleted successfully!`);
    }
    catch(error){
        console.log(error.message);
        return errorResponse(res, `An error occured:- ${error.message}`);
    }
}

/**
 * PHYSICALLY DELETE ALL SERVICES FROM DATABASE
 * @param {*} req 
 * @param {*} res 
 */

const deleteAllServices = async (req,res) => { 
    try{
        await DB.services.destroy({ force: true, where: { userId: req.user.id } });
        return successResponse(res, `All services deleted successfully!`);
    }
    catch(error){
        console.log(error.message);
        return errorResponse(res, `An error occured:- ${error.message}`);
    }
}

/**
 * PHYSICALLY DELETE MULTIPLE SERVICES FROM DATABASE
 * @param {ids} req 
 * @param {*} res 
 */

const deleteMultipleServices = async (req,res) => { 
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ errors: errors.array() });

        const {ids} = req.body;
        let errorArr = [];
        let successArr = [];
        for(let i=0;i<ids.length;i++){
            const checkService = await DB.services.findOne({ where: { id: ids[i], userId: req.user.id } })
            if (checkService) {
                await checkService.destroy()
                successArr.push({successMsg:`Service with ID ${ids[i]} deleted successfully!`})
            } else {
                errorArr.push({errorMsg:`Service with ID ${ids[i]} not found!`});
            }
        }
        return successResponse(res, `Operation successful!`, {success:successArr.length, successData:successArr, failure:errorArr.length, failureData:errorArr});
    }
    catch(error){
        console.log(error.message);
        return errorResponse(res, `An error occured:- ${error.message}`);
    }
}

module.exports = {deleteMultipleServices,deleteAllServices,deleteService,
    getServiceDetail,createMultipleServices,createService,updateService,getServices
}