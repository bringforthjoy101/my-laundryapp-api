/*************************************************************************
USERS TABLE
*************************************************************************/

module.exports = function(sequelize, Sequelize) {
    var Users = sequelize.define('users', {
        firstName: {
            type: Sequelize.STRING,
            allowNull: false
        },
        lastName: {
            type: Sequelize.STRING,
            allowNull: false
        },
        email: {
            type: Sequelize.STRING,
            unique: true
        },
        password: {
            type: Sequelize.STRING,
            allowNull: false
        },
        phone: {
            type: Sequelize.STRING,
            unique: true
        },
        status: {
            type: Sequelize.ENUM('active', 'inactive'),
            defaultValue: 'active'
        },
    }, {
        freezeTableName: true
    });

    Users.associate = function(models) {
        models.users.hasMany(models.orders, {onDelete: 'cascade',targetKey: "id", foreignKey: 'userId'});
        models.users.hasMany(models.services, {onDelete: 'cascade',targetKey: "id", foreignKey: 'userId'});
        models.users.hasMany(models.clients, {onDelete: 'cascade',targetKey: "id", foreignKey: 'userId'});
        models.users.hasOne(models.businesses, {onDelete: 'cascade',targetKey: "id", foreignKey: 'userId'});
    };

    return Users;

}