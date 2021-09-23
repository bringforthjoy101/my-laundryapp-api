// IMPORT DATABASE FILE
const DB = require('./db');
const { validationResult } = require('express-validator');
const {successResponse, errorResponse} = require('../helpers/utility');
const aws = require('aws-sdk');
const csv = require('fast-csv');
const config = require('../config/config');


/**
 * CREATE MULtiPLE PRODUCTS
 * @param {products array containing product objects} req 
 * @param {*} res 
 * @param {*} next 
 */

const createMultipleProducts= async (req, res, next) => {

        try{
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { products } = req.body;
            let errorArr = [];
            let successArr = [];

            for(let i=0;i<products.length;i++){

                const { name, description, image, qty, price } = products[i];
                const insertData = { name, description, image, qty, price, adminId: req.admin.id };
                const product = await DB.products.findOne({ where: { name } });

                if (!product) {
                    await DB.products.create(insertData);
                    successArr.push({successMsg: `Product ${name} created successfully!`});
                } else {
                    errorArr.push({errorMsg: `Product ${name} already exists!`})
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
 * CREATE SINGLE PRODUCT
 * @param {product object} req 
 * @param {*} res 
 * @param {*} next 
 */

const createProduct= async (req, res, next) => {
        try{
            const errors = validationResult(req);
            if (!errors.isEmpty())
                return res.status(400).json({ errors: errors.array() });
            const { name, description, image, qty, price } = req.body;
            const insert_data = { name, description, image, qty, price, adminId: req.admin.id }

            const product = await DB.products.findOne({ where: { name } });
            if (product)
                return errorResponse(res, `Product ${name} already exists!`);
            const result = await DB.products.create(insert_data);
            if (result)
                return successResponse(res, `Product ${name} created successfully!`);
        }
        catch(error){
            console.log(error);
            return errorResponse(res, `An error occured:- ${error.message}`);
        }
}

/**
 * UPDATE SINGLE PRODUCT
 * @param {product object} req 
 * @param {*} res 
 * @param {*} next 
 */

const updateProduct = async (req, res, next) => {
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ errors: errors.array() });

        const {name, description, image, qty, price, status} = req.body;
        const {productId} = req.body;
        const product = await DB.products.findOne({ where: {id: productId} });
        if (!product)
                return errorResponse(res, `Product with ID ${productId} not found!`);
        const updateData = { 
            name: name ? name : product.name, 
            description: description ? description : product.description, 
            image: image ? image : product.image,
            qty: qty ? qty : product.qty, 
            price: price ? price : product.price,
            status: status ? status : product.status
        };
        await product.update(updateData);
        return successResponse(res, `Product updated successfully!`);
    }
    catch(error){
        console.log(error)
        return errorResponse(res, `An error occured:- ${error.message}`);
    }
}

/**
 * GET PRODUCTS FROM DATABASE, CALLED FROM PRODUCTS LISTING PAGE
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */

const getProducts = async (req, res, next) => {
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ errors: errors.array() });
        const products = await DB.products.findAll();

        if(!products.length)
            return successResponse(res, `No product available!`, []);
        return successResponse(res, `${products.length} product${products.length>1 ? 's' : ''} retrived!`, products);
    }
    catch(error){
        console.log(error.message);
        return errorResponse(res, `An error occured:- ${error.message}`);
    }
}

/**
 * GET PRODUCT DETAIL FROM DATABASE
 * @param {productId} req 
 * @param {*} res 
 */

const getProductDetail = async(req,res) => {
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ errors: errors.array() });
        const {id} = req.params;
        const product = await DB.products.findOne({ where: { id } });
        
        if(!product)
            return errorResponse(res, `Product with ID ${id} not found!`);
        return successResponse(res, `Product details retrived!`, product);
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

const deleteProduct = async (req,res) => { 
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ errors: errors.array() });
        
        const {id} = req.params;
        const checkProduct = await DB.products.findOne({ where: { id } });
        if (!checkProduct)
            return errorResponse(res, `Product with ID ${id} not found!`);
        await checkProduct.destroy({ force: true });
        return successResponse(res, `Product with ID ${id} deleted successfully!`);
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
    
        let products = [];
        
        s3.getObject(params).createReadStream()
          .pipe(csv.parse({ headers: true }))
          .on("error", (error) => {
            throw error.message;
          })
          .on("data", async (row) => {
            products.push(row);
          })
          .on("end", async () => {
            req.body.products = products 
             
            // perform multiple create operation
            createMultipleProducts(req,res)  
          });
    }
    catch(error){
        return errorResponse(res, `An error occured:- ${error.message}`);
    }
}

module.exports = {uploadFile,deleteMultipleProducts,deleteAllProducts,deleteProduct,
    getProductDetail,createMultipleProducts,createProduct,updateProduct,getProducts,uploadCSV
}