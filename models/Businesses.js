/*************************************************************************
BUSINESSES TABLE
*************************************************************************/

module.exports = function(sequelize, Sequelize) {
    var Businesses = sequelize.define('businesses', {
        name: {
            type: Sequelize.STRING
        },
        address: {
            type: Sequelize.STRING
        },
        phone: {
            type: Sequelize.STRING
        },
        logo: {
            type: Sequelize.STRING
        },
        email: {
            type: Sequelize.STRING
        },
        bankName: {
            type: Sequelize.STRING,
        },
        accountName: {
            type: Sequelize.STRING
        },
        bankAccountNumber: {
            type: Sequelize.STRING
        },
        status: {
            type: Sequelize.ENUM('active', 'inactive'),
            defaultValue: 'active'
        },
    }, {
        freezeTableName: true
    });

    Businesses.associate = function(models) {
        models.businesses.belongsTo(models.users, {onDelete: 'CASCADE',targetKey: "id", foreignKey: 'userId'});
    };

    return Businesses;

}