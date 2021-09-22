const config = require('../config/config')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs');
const DB = require('./db');
const { handleResponse } = require('../helpers/utility');
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
    
    const {firstName, lastName, phone, role, email, password} = req.body;
    let insertData = { firstName, lastName, phone, role, email };
    //Hash password
    const salt = await bcrypt.genSalt(15);
    const hashPassword = await bcrypt.hash(password, salt);
    insertData = {...insertData, password:hashPassword}
    // insertData.password = hashPassword;
    
    try {
        const adminExists = await DB.admins.findOne({where:{email}});
        
        // if admin exists stop the process and return a message
        if (adminExists) 
            return handleResponse(res, 400, false, `Admin with email ${email} already exists`);

        const admin = await DB.admins.create(insertData);
        
        if (admin) {
            let payload = { 
                id: admin.id,
                firstName, lastName, phone, email, role: admin.role
            };
            const token = jwt.sign(payload, config.JWTSECRET);
            const data ={ token, admin:payload }
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
        const admin = await DB.admins.findOne({ where:{email} });
        
        if (admin) {
            const validPass = await bcrypt.compareSync(password, admin.password);
            if (!validPass) return handleResponse(res, 401, false, `Email or Password is incorrect!`);

            if (admin.status === 'inactive') return handleResponse(res, 401, false, `Account Suspended!, Please contact Administrator`);
    
            // Create and assign token
            let payload = { 
                id: admin.id, 
                email, 
                firstName: admin.firstName, 
                lastName: admin.lastName,
                phone: admin.phone,
                role: admin.role
            };
            const token = jwt.sign(payload, config.JWTSECRET);
    
            return res.status(200).header("auth-token", token).send({ 
                success: true, 
                message: 'Operation Successfull',
                token, 
                admin: payload 
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

        let verifiedAdmin = jwt.verify(token, config.JWTSECRET);   // config.JWTSECRET => 'secretKey'
        if (!verifiedAdmin) return handleResponse(res, 401, false, `Unauthorized request`);
        // verifiedUser.type === 'admin' ? req.admin = verifiedUser : verifiedUser.type === 'user' ? req.user = verifiedUser : handleResponse(res, 401, false, `Unidentified access`);
        req.admin = verifiedAdmin; // user_id & user_type_id
        next();

    } catch (error) {
        handleResponse(res, 400, false, `Token Expired`);
    }
};

const isAdmin = async (req, res, next) => {
    if (!req.admin)
        return handleResponse(res, 401, false, `Access Denied / Unauthorized request`); 
    next();
};

const getAdmins = async (req, res, next) => {
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ errors: errors.array() });
        const admins = await DB.admins.findAll();

        if(!admins.length)
            return successResponse(res, `No admin available!`, []);
        return successResponse(res, `${admins.length} admin${admins.length>1 ? 's' : ''} retrived!`, admins);
    }
    catch(error){
        console.log(error.message);
        return errorResponse(res, `An error occured:- ${error.message}`);
    }
}

    
module.exports = {
    isAuthorized, isAdmin, login, register, getAdmins
}