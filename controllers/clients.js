// IMPORT DATABASE FILE
const DB = require('./db');
const { validationResult } = require('express-validator');
const {successResponse, errorResponse} = require('../helpers/utility');
const aws = require('aws-sdk');
const csv = require('fast-csv');
const config = require('../config/config');
const { updateWallet } = require('../helpers/wallet');
const { Op } = require('sequelize');


/**
 * CREATE MULtiPLE CLIENTS
 * @param {clients array containing client objects} req 
 * @param {*} res 
 * @param {*} next 
 */

const createMultipleClients= async (req, res, next) => {

        try{
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { clients } = req.body;
            let errorArr = [];
            let successArr = [];

            for(let i=0;i<clients.length;i++){

                const { names, location, phone } = clients[i];
                const insertData = { names, location, phone };
                await DB.clients.create(insertData);
                successArr.push({successMsg: `Client ${names} created successfully!`});
            }
            return successResponse(res, `Operation completed!`, {success:successArr.length, successData:successArr, failure:errorArr.length, failureData:errorArr});
        }
        catch(error){
            console.log(error);
            return errorResponse(res, `An error occured:- ${error.message}`);
        }
}


/**
 * CREATE SINGLE STUDENT
 * @param {client object} req 
 * @param {*} res 
 * @param {*} next 
 */

const createClient= async (req, res, next) => {
        try{
            const errors = validationResult(req);
            if (!errors.isEmpty())
                return res.status(400).json({ errors: errors.array() });
            const { id, business } = req.user;
            if (!business) return errorResponse(res, `Please, create a business!`);
            const { names, location, phone,  } = req.body;
            Op
            const client = await DB.clients.findOne({ where: {
                [Op.or]: [
                    { names },
                    { phone }
                ]
            }})
            if(client) return errorResponse(res, 'Client with name or phone already exists');
            const insert_data = { names, location, phone, businessId: business.id, userId: id };
            const result = await DB.clients.create(insert_data);
            if (result)
                return successResponse(res, `Client ${names} created successfully!`);
        }
        catch(error){
            console.log(error);
            return errorResponse(res, `An error occured:- ${error.message}`);
        }
}

/**
 * UPDATE SINGLE STUDENT
 * @param {client object} req 
 * @param {*} res 
 * @param {*} next 
 */

const updateClient = async (req, res, next) => {
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ errors: errors.array() });

        const {id} = req.params;
        const {names, location, phone, status} = req.body;
        const client = await DB.clients.findOne({ where: {id} });
        if (!client)
                return errorResponse(res, `Client with ID ${id} not found!`);
        const updateData = { 
            names: names ? names : client.names, 
            location: location ? location : client.location, 
            phone: phone ? phone : client.phone,
            status: status ? status : client.status
        };
        await client.update(updateData);
        return successResponse(res, `Client updated successfully!`);
    }
    catch(error){
        console.log(error)
        return errorResponse(res, `An error occured:- ${error.message}`);
    }
}

const creditOrDebitClientWallet = async (req, res, next) => {
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ errors: errors.array() });
        const { amount, narration, clientId, type } = req.body;
        const transactionId = new Date().getTime();
        const walletData = {
            clientId,
            transactionId,
            amount,
            narration,
            type
        }
        const logTransaction = await updateWallet(walletData);
        if(!logTransaction.status)
            return errorResponse(res, `An error occured:- ${logTransaction.message}`);
        return successResponse(res, `Operation Successful!`);
    }
    catch(error){
        console.log(error);
        return errorResponse(res, `An error occured:- ${error.message}`);
    }
}

/**
 * GET CLIENTS FROM DATABASE, CALLED FROM CLIENTS LISTING PAGE
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */

const getClients = async (req, res, next) => {
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ errors: errors.array() });
        let where = {businessId: req.user.business.id};
        const {type} = req.params;
        const clients = await DB.clients.findAll({ where, order: [ ['id', 'DESC'] ] });

        if(!clients.length)
            return successResponse(res, `No client available!`, []);
        return successResponse(res, `${clients.length} client${clients.length>1 ? 's' : ''} retrived!`, clients);
    }
    catch(error){
        console.log(error);
        return errorResponse(res, `An error occured:- ${error.message}`);
    }
}

/**
 * GET STUDENT DETAIL FROM DATABASE
 * @param {clientId} req 
 * @param {*} res 
 */

const getClientDetail = async(req,res) => {
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ errors: errors.array() });
        const {id} = req.params;
        const client = await DB.clients.findOne({ where: { id }, include: [
            { model: DB.orders, order: [ ['id', 'DESC'] ], include: {model: DB.users, attributes: ['id', 'firstName', 'lastName']} }
        ], order: [ ['id', 'DESC'] ] });
        
        if(!client)
            return errorResponse(res, `Client with ID ${id} not found!`);
        return successResponse(res, `Client details retrived!`, client);
    }
    catch(error){
        return errorResponse(res, `An error occured:- ${error.message}`);
    }
}


/**
 * PHYSICALLY DELETE SINGLE STUDENT FROM DATABASE
 * @param {clientId} req 
 * @param {*} res 
 */

const deleteClient = async (req,res) => { 
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ errors: errors.array() });
        
        const {id} = req.params;
        const checkClient = await DB.clients.findOne({ where: { id, businessId: req.user.business.id } });
        if (!checkClient)
            return errorResponse(res, `Client with ID ${id} not found!`);
        await checkClient.destroy({ force: true });
        return successResponse(res, `Client with ID ${id} deleted successfully!`);
    }
    catch(error){
        console.log(error.message);
        return errorResponse(res, `An error occured:- ${error.message}`);
    }
}

/**
 * PHYSICALLY DELETE ALL CLIENTS FROM DATABASE
 * @param {*} req 
 * @param {*} res 
 */

const deleteAllClients = async (req,res) => { 
    try{
        await DB.clients.destroy({ force: true, where: { businessId: req.user.business.id } });
        return successResponse(res, `All clients deleted successfully!`);
    }
    catch(error){
        console.log(error.message);
        return errorResponse(res, `An error occured:- ${error.message}`);
    }
}

/**
 * PHYSICALLY DELETE MULTIPLE CLIENTS FROM DATABASE
 * @param {ids} req 
 * @param {*} res 
 */

const deleteMultipleClients = async (req,res) => { 
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ errors: errors.array() });

        const {ids} = req.body;
        let errorArr = [];
        let successArr = [];
        for(let i=0;i<ids.length;i++){
            const checkClient = await DB.clients.findOne({ where: { id: ids[i], businessId: req.user.business.id } })
            if (checkClient) {
                await checkClient.destroy()
                successArr.push({successMsg:`Client with ID ${ids[i]} deleted successfully!`})
            } else {
                errorArr.push({errorMsg:`Client with ID ${ids[i]} not found!`});
            }
        }
        return successResponse(res, `Operation successful!`, {success:successArr.length, successData:successArr, failure:errorArr.length, failureData:errorArr});
    }
    catch(error){
        console.log(error.message);
        return errorResponse(res, `An error occured:- ${error.message}`);
    }
}

module.exports = {deleteMultipleClients,deleteAllClients,deleteClient,
    getClientDetail,createMultipleClients,createClient,updateClient, creditOrDebitClientWallet,getClients
}