const express = require('express');
const {login, register, isAdmin, getAdmins, dashboardData} = require('./controllers/authentication');
const {upload} = require('./helpers/upload');

const mail = require('./controllers/mail')
const subscription = require('./controllers/subscription');
const products = require('./controllers/products');
const orders = require('./controllers/orders');
const transactions = require('./controllers/transactions');
const students = require('./controllers/students');
const general = require('./controllers/general');
const {validate} = require('./validate');

const router = express.Router()

/*************************************************************************
API CALL START
*************************************************************************/

// INDEX ROUTE TO SHOW API IS WORKING FINE
router.get('/', (req, res, next) => {res.status(200).send("API Working")});
router.post('/send/contact', validate('/send/contact'), mail.sendContactMail);
router.post('/subscribe', validate('/subscribe'), subscription.subscribe);
router.get('/unsubscribe/:email', subscription.unsubscribe);
router.get('/subscribers', subscription.getSubscribers);

// LOGIN && REGISTER ROUTE
router.post('/login', validate('/login'), login);
router.post('/register', validate('/register'), register);
router.get('/admins', getAdmins);
router.get('/dashboard', dashboardData);
router.post('/upload-images', upload.array('image',1), general.uploadFile);

router.post('/products/create', validate('/products/create'), products.createProduct);
router.post('/products/update/:id', validate('/products/update'), products.updateProduct);
router.get('/products', products.getProducts);
router.get('/products/get-detail/:id', validate('id'), products.getProductDetail);
router.get('/products/delete/:id', validate('id'), products.deleteProduct);

router.post('/students/create', validate('/students/create'), students.createStudent);
router.post('/students/update/:id', validate('/students/update'), students.updateStudent);
router.post('/students/wallet', validate('/students/wallet'), students.creditOrDebitStudentWallet);
router.get('/students', students.getStudents);
router.get('/students/get-detail/:id', validate('id'), students.getStudentDetail);
router.get('/students/delete/:id', validate('id'), students.deleteStudent);

router.post('/orders/create', validate('/orders/create'), orders.createOrder);
router.get('/orders', orders.getOrders);
router.get('/transactions', transactions.getTransactions);
router.get('/orders/get-detail/:id', validate('id'), orders.getOrderDetail);
router.get('/transactions/get-detail/:id', validate('id'), transactions.getTransactionDetail);

module.exports = router;