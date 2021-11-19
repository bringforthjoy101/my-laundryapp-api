const config = require('../config/config')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs');
const DB = require('./db');
const { Op } = require('sequelize');
const moment = require('moment');
const { handleResponse, successResponse, errorResponse } = require('../helpers/utility');
const { validationResult } = require('express-validator');


/**
 * check if user is authorized
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */

 const register = async (req, res, next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    
    const {firstName, lastName, phone, email, password} = req.body;
    let insertData = { firstName, lastName, phone, email };
    //Hash password
    const salt = await bcrypt.genSalt(15);
    const hashPassword = await bcrypt.hash(password, salt);
    insertData = {...insertData, password:hashPassword}
    // insertData.password = hashPassword;
    
    try {
        const userExists = await DB.users.findOne({ where: { 
            [Op.or]: [
                { email },
                { phone }
            ] 
        } });
        
        // if user exists stop the process and return a message
        // console.log(insertData)
        if (userExists) 
            return handleResponse(res, 401, false, `User with email or phone already exists`);

        const user = await DB.users.create(insertData);
        
        if (user) {
            const business = await DB.businesses.create({phone, email, userId:user.id});
            let payload = { 
                id: user.id,
                firstName, lastName, phone, email, business
            };
            const token = jwt.sign(payload, config.JWTSECRET);
            const data ={ token, user:payload }
            return handleResponse(res, 200, true, `Registration successfull`, data);
        }
        else {
            return handleResponse(res, 401, false, `An error occured`);
        }
    } catch (error) {
        console.log(error);
        return handleResponse(res, 401, false, `An error occured - ${error}`);
    }
};

const login = async (req, res, next) => {
    const {email, password} = req.body;
    try {
        const user = await DB.users.findOne({ where: { email }, include: { model: DB.businesses } });
        
        if (user) {
            const validPass = await bcrypt.compareSync(password, user.password);
            if (!validPass) return handleResponse(res, 401, false, `Email or Password is incorrect!`);

            if (user.status === 'inactive') return handleResponse(res, 401, false, `Account Suspended!, Please contact Administrator`);
    
            // Create and assign token
            let payload = { 
                id: user.id, 
                email, 
                firstName: user.firstName, 
                lastName: user.lastName,
                phone: user.phone,
                role: user.role,
                business: user.business
            };
            const token = jwt.sign(payload, config.JWTSECRET);
    
            return res.status(200).header("auth-token", token).send({ 
                success: true, 
                message: 'Operation Successfull',
                token, 
                user: payload 
            });
        }
        else {
            return handleResponse(res, 401, false, `Incorrect Email`);
        }
    } catch (error) {
        console.log(error);
        return handleResponse(res, 401, false, `An error occured - ${error}`);
    }
};

const changePassword = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const {email, oldPassword, newPassword} = req.body;
    try {
        const user = await DB.users.findOne({ where: { email, status: 'active' } });
        if(!user) return handleResponse(res, 400, false, `User not found!`);
        const validPassword = await bcrypt.compareSync(oldPassword, user.password);
        if (!validPassword) return handleResponse(res, 400, false, `Incorrect  old password!`);
        const salt = await bcrypt.genSalt(15);
        const hashPassword = await bcrypt.hash(newPassword, salt);
        const changedPassword = await user.update({password: hashPassword});
        if (!changedPassword) return handleResponse(res, 400, false, `Unable change password!`);
        return handleResponse(res, 200, true, `Password changed successfully`);
    } catch (error) {
        console.log(error);
        return handleResponse(res, 401, false, `An error occured - ${error}`);
    }
    
}

const isAuthorized = async (req, res, next) => {
    
    //this is the url without query params
    let current_route_path = req.originalUrl.split("?").shift();

    let routes_excluded_from_auth = config.ROUTES_EXCLUDED_FROM_AUTH;
    // console.log(routes_excluded_from_auth.indexOf(current_route_path));
    if(routes_excluded_from_auth.indexOf(current_route_path)>-1){
        return next();
    }
    
    let token = req.headers.authorization;
    if (!token) return handleResponse(res, 401, false, `Access Denied / Unauthorized request`);

    try {
        token = token.split(' ')[1]; // Remove Bearer from string

        if (token === 'null' || !token) return handleResponse(res, 401, false, `Unauthorized request`);

        let verifiedUser = jwt.verify(token, config.JWTSECRET);   // config.JWTSECRET => 'secretKey'
        if (!verifiedUser) return handleResponse(res, 401, false, `Unauthorized request`);
        // verifiedUser.type === 'user' ? req.user = verifiedUser : verifiedUser.type === 'user' ? req.user = verifiedUser : handleResponse(res, 401, false, `Unidentified access`);
        req.user = verifiedUser; // user_id & user_type_id
        next();

    } catch (error) {
        handleResponse(res, 400, false, `Token Expired`);
    }
};

const isUser = async (req, res, next) => {
    if (!req.user)
        return handleResponse(res, 401, false, `Access Denied / Unauthorized request`); 
    next();
};

const getUsers = async (req, res, next) => {
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ errors: errors.array() });
        const users = await DB.users.findAll();

        if(!users.length)
            return successResponse(res, `No user available!`, []);
        return successResponse(res, `${users.length} user${users.length>1 ? 's' : ''} retrived!`, users);
    }
    catch(error){
        console.log(error.message);
        return errorResponse(res, `An error occured:- ${error.message}`);
    }
}

const dashboardData = async (req, res, next) => {
    try {
        const clients = await DB.clients.findAll({ where: { userId: req.user.id}});
        const services = await DB.services.findAll({ where: { userId: req.user.id}});
        const orders = await DB.orders.findAll({ where: { userId: req.user.id}});

        const totalSales = await DB.orders.sum('amount');
        const maxSales = await DB.orders.max('amount');
        const avgSales = totalSales / orders.length;

        // const salesToday = await DB.orders.findAll({
        //     where: {
        //         createdAt: {
        //             [Op.gte]: moment().startOf('date')
        //         },
        //     }
        // });
        const salesToday = await DB.orders.sum('amount', {
            where: {
                createdAt: {
                    [Op.gte]: moment().startOf('date')
                }
            }
        });
        const salesYesterday = await DB.orders.sum('amount', {
            where: {
                createdAt: {
                    [Op.gte]: moment().startOf('day').add(-1, 'day'),
                    [Op.lte]: moment().startOf('day')
                }
            }
        });
        const salesThisWeek = await DB.orders.sum('amount', {
            where: {
                createdAt: {
                    [Op.gte]: moment().startOf('week'),
                    [Op.lte]: moment().endOf('day')
                }
            }
        });
        const salesThisMonth = await DB.orders.sum('amount', {
            where: {
                createdAt: {
                    [Op.gte]: moment().startOf('month'),
                    [Op.lte]: moment().endOf('day')
                }
            }
        });
        const salesThisYear = await DB.orders.sum('amount', {
            where: {
                createdAt: {
                    [Op.gte]: moment().startOf('year'),
                    [Op.lte]: moment().endOf('day')
                }
            }
        });
        const salesSoFar = await DB.orders.sum('amount');

        const data = {
            totalClients: clients.length,
            totalServices: services.length,
            totalOrders: orders.length,
            sales: {
                totalSales, maxSales, avgSales, salesToday, salesYesterday, salesThisWeek, salesThisMonth, salesThisYear, salesSoFar
            }
        }
        
        return successResponse(res, `Dashboard data retrived!`, data);
    } catch (error) {
        console.log(error.message);
        return errorResponse(res, `An error occured:- ${error.message}`);
    }
}

    
module.exports = {
    isAuthorized, isUser, login, register, changePassword, getUsers, dashboardData
}