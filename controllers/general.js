const { successResponse, errorResponse } = require('../helpers/utility');

const uploadFile = async (req,res) => { 
    try{
        return successResponse(res, `File uploaded successfully!`, req.files[0].location);
    }
    catch(error){
        return errorResponse(res, `An error occured:- ${error.message}`);
    }
}

module.exports = { uploadFile }