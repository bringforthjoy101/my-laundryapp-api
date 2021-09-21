/*************************************************************************
ADMINS TABLE
*************************************************************************/

module.exports = function(sequelize, Sequelize) {
    var Admins = sequelize.define('admins', {
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
        role: {
            type: Sequelize.ENUM('manager', 'busary', 'sales rep'),
            defaultValue: 'sales rep'
        },
        status: {
            type: Sequelize.ENUM('active', 'inactive'),
            defaultValue: 'active'
        },
    }, {
        freezeTableName: true
    });

    Admins.associate = function(models) {
        models.admins.hasMany(models.orders, {onDelete: 'cascade',targetKey: "id", foreignKey: 'adminId'});
        models.admins.hasMany(models.products, {onDelete: 'cascade',targetKey: "id", foreignKey: 'adminId'});
        models.admins.hasMany(models.stocks, {onDelete: 'cascade',targetKey: "id", foreignKey: 'adminId'});
    };

    return Admins;

}