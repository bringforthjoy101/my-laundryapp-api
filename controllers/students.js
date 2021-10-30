// IMPORT DATABASE FILE
const DB = require('./db');
const { validationResult } = require('express-validator');
const {successResponse, errorResponse} = require('../helpers/utility');
const aws = require('aws-sdk');
const csv = require('fast-csv');
const config = require('../config/config');
const { updateWallet } = require('../helpers/wallet');


/**
 * CREATE MULtiPLE STUDENTS
 * @param {students array containing student objects} req 
 * @param {*} res 
 * @param {*} next 
 */

const createMultipleStudents= async (req, res, next) => {

        try{
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { students } = req.body;
            let errorArr = [];
            let successArr = [];

            for(let i=0;i<students.length;i++){

                const { firstName, lastName, otherName, type, className, level, group, role } = students[i];
                const insertData = { firstName, lastName, otherName, type, class:className, level, group, role };
                await DB.students.create(insertData);
                successArr.push({successMsg: `Student ${firstName} ${lastName} created successfully!`});
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
 * @param {student object} req 
 * @param {*} res 
 * @param {*} next 
 */

const createStudent= async (req, res, next) => {
        try{
            const errors = validationResult(req);
            if (!errors.isEmpty())
                return res.status(400).json({ errors: errors.array() });
            const { firstName, lastName, otherName, type, className, level, group, avatar, role } = req.body;
            const insert_data = { firstName, lastName, otherName, type, class:className, level, group, avatar, role }

            const result = await DB.students.create(insert_data);
            if (result)
                return successResponse(res, `Student ${firstName} ${lastName} created successfully!`);
        }
        catch(error){
            console.log(error);
            return errorResponse(res, `An error occured:- ${error.message}`);
        }
}

/**
 * UPDATE SINGLE STUDENT
 * @param {student object} req 
 * @param {*} res 
 * @param {*} next 
 */

const updateStudent = async (req, res, next) => {
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ errors: errors.array() });

        const {id} = req.params;
        const {firstName, lastName, otherName, type, className, level, group, wallet, status, avatar} = req.body;
        const student = await DB.students.findOne({ where: {id} });
        if (!student)
                return errorResponse(res, `Student with ID ${id} not found!`);
        const updateData = { 
            firstName: firstName ? firstName : student.firstName, 
            lastName: lastName ? lastName : student.lastName, 
            otherName: otherName ? otherName : student.otherName,
            type: type ? type : student.type,
            class: className ? className : student.class, 
            level: level ? level : student.level,
            group: group ? group : student.group,
            wallet: wallet ? Number(student.wallet) + Number(wallet) : student.wallet,
            status: status ? status : student.status,
            role: role ? role : student.role,
            avatar: avatar ? avatar : student.avatar
        };
        await student.update(updateData);
        return successResponse(res, `Student updated successfully!`);
    }
    catch(error){
        console.log(error)
        return errorResponse(res, `An error occured:- ${error.message}`);
    }
}

const creditOrDebitStudentWallet = async (req, res, next) => {
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ errors: errors.array() });
        const { amount, narration, studentId, type } = req.body;
        const transactionId = new Date().getTime();
        const walletData = {
            studentId,
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
 * GET STUDENTS FROM DATABASE, CALLED FROM STUDENTS LISTING PAGE
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */

const getStudents = async (req, res, next) => {
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ errors: errors.array() });
        let where = {role: 'student'};
        const {type} = req.params;
        if(type) {
            where = {...where, role:type}
        }
        const students = await DB.students.findAll({ where, order: [ ['id', 'DESC'] ] });

        if(!students.length)
            return successResponse(res, `No student available!`, []);
        return successResponse(res, `${students.length} student${students.length>1 ? 's' : ''} retrived!`, students);
    }
    catch(error){
        console.log(error);
        return errorResponse(res, `An error occured:- ${error.message}`);
    }
}

/**
 * GET STUDENT DETAIL FROM DATABASE
 * @param {studentId} req 
 * @param {*} res 
 */

const getStudentDetail = async(req,res) => {
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ errors: errors.array() });
        const {id} = req.params;
        const student = await DB.students.findOne({ where: { id }, include: [
            { model: DB.orders, order: [ ['id', 'DESC'] ], include: {model: DB.admins, attributes: ['id', 'firstName', 'lastName']} }, 
            { model: DB.transactions, order: [ ['id', 'DESC'] ], include: {model: DB.admins, attributes: ['id', 'firstName', 'lastName']} }
        ], order: [ ['id', 'DESC'] ] });
        
        if(!student)
            return errorResponse(res, `Student with ID ${id} not found!`);
        return successResponse(res, `Student details retrived!`, student);
    }
    catch(error){
        return errorResponse(res, `An error occured:- ${error.message}`);
    }
}


/**
 * PHYSICALLY DELETE SINGLE STUDENT FROM DATABASE
 * @param {studentId} req 
 * @param {*} res 
 */

const deleteStudent = async (req,res) => { 
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ errors: errors.array() });
        
        const {id} = req.params;
        const checkStudent = await DB.students.findOne({ where: { id } });
        if (!checkStudent)
            return errorResponse(res, `Student with ID ${id} not found!`);
        await checkStudent.destroy({ force: true });
        return successResponse(res, `Student with ID ${id} deleted successfully!`);
    }
    catch(error){
        console.log(error.message);
        return errorResponse(res, `An error occured:- ${error.message}`);
    }
}

/**
 * PHYSICALLY DELETE ALL STUDENTS FROM DATABASE
 * @param {*} req 
 * @param {*} res 
 */

const deleteAllStudents = async (req,res) => { 
    try{
        await DB.students.destroy({ force: true });
        return successResponse(res, `All students deleted successfully!`);
    }
    catch(error){
        console.log(error.message);
        return errorResponse(res, `An error occured:- ${error.message}`);
    }
}

/**
 * PHYSICALLY DELETE MULTIPLE STUDENTS FROM DATABASE
 * @param {ids} req 
 * @param {*} res 
 */

const deleteMultipleStudents = async (req,res) => { 
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ errors: errors.array() });

        const {ids} = req.body;
        let errorArr = [];
        let successArr = [];
        for(let i=0;i<ids.length;i++){
            const checkStudent = await DB.students.findOne({ where: { id: ids[i] } })
            if (checkStudent) {
                await checkStudent.destroy()
                successArr.push({successMsg:`Student with ID ${ids[i]} deleted successfully!`})
            } else {
                errorArr.push({errorMsg:`Student with ID ${ids[i]} not found!`});
            }
        }
        return successResponse(res, `Operation successful!`, {success:successArr.length, successData:successArr, failure:errorArr.length, failureData:errorArr});
    }
    catch(error){
        console.log(error.message);
        return errorResponse(res, `An error occured:- ${error.message}`);
    }
}

/**
 * UPLOAD FILE TO s3 RETURN METHOD 
 * @param {*} req 
 * @param {*} res 
 */

const uploadFile = async (req,res) => { 
    try{
        return successResponse(res, `File uploaded successfully!`, req.files[0].location);
    }
    catch(error){
        return errorResponse(res, `An error occured:- ${error.message}`);
    }
}

/**
 * UPLOAD CSV FILE 
 * @param {*} req 
 * @param {*} res 
 */

const uploadCSV = async (req,res) => { 
    try{
        var s3 = new aws.S3();
        var params = {Bucket: config.BUCKETNAME, Key: req.files[0].key};
    
        let students = [];
        
        s3.getObject(params).createReadStream()
          .pipe(csv.parse({ headers: true }))
          .on("error", (error) => {
            throw error.message;
          })
          .on("data", async (row) => {
            students.push(row);
          })
          .on("end", async () => {
            req.body.students = students 
             
            // perform multiple create operation
            createMultipleStudents(req,res)  
          });
    }
    catch(error){
        return errorResponse(res, `An error occured:- ${error.message}`);
    }
}

module.exports = {uploadFile,deleteMultipleStudents,deleteAllStudents,deleteStudent,
    getStudentDetail,createMultipleStudents,createStudent,updateStudent, creditOrDebitStudentWallet,getStudents,uploadCSV
}