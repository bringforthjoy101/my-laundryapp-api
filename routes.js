const express = require('express');
const {login, register, changePassword, isAdmin, getAdmins, dashboardData} = require('./controllers/authentication');
const {upload} = require('./helpers/upload');

const services = require('./controllers/services');
const businesses = require('./controllers/businesses');
const orders = require('./controllers/orders');
const clients = require('./controllers/clients');
const general = require('./controllers/general');
const {validate} = require('./validate');

const router = express.Router()

/*************************************************************************
API CALL START
*************************************************************************/

// INDEX ROUTE TO SHOW API IS WORKING FINE
router.get('/', (req, res, next) => {res.status(200).send("API Working")});

// LOGIN && REGISTER ROUTE
router.post('/login', validate('/login'), login);
router.post('/register', validate('/register'), register);
router.post('/change-password', validate('/change-password'), changePassword);
// router.get('/users', getAdmins);
router.get('/dashboard', dashboardData);
router.post('/upload-images', upload.array('image',1), general.uploadFile);

router.post('/services/create', validate('/services/create'), services.createService);
router.post('/services/update/:id', validate('/services/update'), services.updateService);
router.get('/services', services.getServices);
router.get('/services/get-detail/:id', validate('id'), services.getServiceDetail);
router.get('/services/delete/:id', validate('id'), services.deleteService);

router.post('/businesses/create', validate('/businesses/create'), businesses.createBusiness);
router.post('/businesses/update/:id', validate('/businesses/update'), businesses.updateBusiness);
router.get('/businesses', businesses.getMyBusiness);
router.get('/businesses/get-detail/:id', validate('id'), businesses.getBusinessDetail);
router.get('/businesses/delete/:id', validate('id'), businesses.deleteBusiness);

router.post('/clients/create', validate('/clients/create'), clients.createClient);
router.post('/clients/update/:id', validate('/clients/update'), clients.updateClient);
router.get('/clients', clients.getClients);
router.get('/clients/get-detail/:id', validate('id'), clients.getClientDetail);
router.get('/clients/delete/:id', validate('id'), clients.deleteClient);

router.post('/orders/create', validate('/orders/create'), orders.createOrder);
router.post('/orders/update/:id', validate('/orders/update'), orders.updateOrder);
router.get('/orders', orders.getOrders);
router.get('/orders/get-detail/:id', validate('id'), orders.getOrderDetail);

module.exports = router;