/*************************************************************************
ORDERS TABLE
*************************************************************************/

module.exports = function(sequelize, Sequelize) {
    
    const Orders = sequelize.define('orders', {
        
        orderNumber: {
            type: Sequelize.STRING,
            allowNull: false
        },
        amount: {
            type: Sequelize.DOUBLE.UNSIGNED,
            allowNull: false
        },
        services: {
            type: Sequelize.JSON,
            allowNull: false
        },
        subTotal: {
            type: Sequelize.DOUBLE.UNSIGNED,
            allowNull: false
        },
        tax: {
            type: Sequelize.DOUBLE.UNSIGNED,
            allowNull: false
        },
        discount: {
            type: Sequelize.DOUBLE.UNSIGNED,
            allowNull: false
        },
        shipping: {
            type: Sequelize.DOUBLE.UNSIGNED,
            allowNull: false
        },
        status: {
            type: Sequelize.ENUM('paid', 'unpaid'),
            defaultValue: 'unpaid'
        },
    }, {
        freezeTableName: true
    });

    Orders.associate = function(models) {
        models.orders.belongsTo(models.clients, {onDelete: 'CASCADE',targetKey: "id", foreignKey: 'clientId'});
        models.orders.belongsTo(models.users, {onDelete: 'CASCADE',targetKey: "id", foreignKey: 'userId'});
        models.orders.belongsTo(models.businesses, {onDelete: 'cascade',targetKey: "id", foreignKey: 'businessId'});
    };

    return Orders;

}