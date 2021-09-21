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
        products: {
            type: Sequelize.JSON,
            allowNull: false
        },
        transactionId: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        studentId: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        adminId: {
            type: Sequelize.INTEGER,
            allowNull: false
        }
    }, {
        freezeTableName: true
    });

    Orders.associate = function(models) {
        models.orders.belongsTo(models.students, {onDelete: 'CASCADE',targetKey: "id", foreignKey: 'studentId'});
        models.orders.belongsTo(models.admins, {onDelete: 'CASCADE',targetKey: "id", foreignKey: 'adminId'});
        models.orders.belongsTo(models.transactions, {onDelete: 'cascade',targetKey: "id", foreignKey: 'transactionId'});
    };

    return Orders;

}