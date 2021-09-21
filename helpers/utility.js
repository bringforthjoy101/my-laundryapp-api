const handleResponse = (res, statusCode, status, message, data) => {
    return res.status(statusCode).json({
        status, message, data
    });
}

const successResponse = (res, message = 'Operation successfull', data) => {
    return res.status(200).json({
        status: true, 
        message, data
    })
}

const errorResponse = (res, message = 'An error occured', data) => {
    return res.status(400).json({
        status: false,
        message, data
    })
}

const generateOrderId = () => {
    return Math.floor((Math.random() * 1000000000) + 1).toString(16);
}
// console.log(new Date().getTime(), Math.floor((Math.random() * 1000000000) + 1).toString(16))

module.exports = {
    handleResponse, successResponse, errorResponse, generateOrderId
}