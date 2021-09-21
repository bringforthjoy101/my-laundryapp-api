
// ADD LIBRARIES
const config = require('./config/config');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const routes = require("./routes");
const authenticate = require('./controllers/authentication')

// CREATE APP
const app = express()

// PARSE JSON
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ENABLE CORS AND START SERVER
app.use(cors({ origin: true }))
app.listen(config.PORT,async function(){
    console.log("Server started On PORT: "+config.PORT);
});

//Routes
app.all('*', authenticate.isAuthorized);
app.use(routes);