/**
 * DB Layer module.
 * Author: Emmanuel Adelugba Bringforthjoy.
 * Version: 1.0.0
 * Release Date: 24-August-2021
 * Last Updated: 24-August-2021
 */

/**
 * Module dependencies.
 */
 
 var fs = require("fs");
 var path = require("path");
 var {Sequelize} = require('sequelize');
 var config = require('../config/config');
 var db = {};
 
 
 // var sequelize = new Sequelize(config.db.database, config.db.username, config.db.password, config.db.sequelizeParams);
 const sequelize = new Sequelize(config.DBNAME, config.DBUSERNAME, config.DBPASSWORD, {
     host: config.DBHOST,
     port: config.DBPORT,
     multipleStatements: true,
     dialect: config.DBDIALECT,
     logging: false,
    //  dialectOptions: {
    //      ssl: { rejectUnauthorized: false }
    //  }
 });
 
 
 
 const Op = Sequelize.Op
 db.Op = Op
 // load models
 
 fs.readdirSync(__dirname + '/../models')
     .filter(function(file) {
         return (file.indexOf(".") !== 0) && (file !== "index.js");
     })
     .forEach(function(file) {
        //  var model = sequelize.import(path.join(__dirname + '/../models', file));
         var model = require(path.join(__dirname + '/../models', file))(sequelize, Sequelize.DataTypes)
         db[model.name] = model;
     });
 
 Object.keys(db).forEach(function(modelName) {
     if ("associate" in db[modelName]) {
         db[modelName].associate(db);
     }
 });
 
 //Sync Database
 sequelize.sync().then(async function() {
 }).catch(function(err) {
     console.log(err, "Something went wrong with the Database Update!");
 });
 
 // exports
 db.Sequelize = Sequelize;
 db.sequelize = sequelize;
 
 module.exports = db;