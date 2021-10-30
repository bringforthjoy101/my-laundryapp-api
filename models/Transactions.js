/*************************************************************************
TRANSACTIONS TABLE
*************************************************************************/

module.exports = function(sequelize, Sequelize) {
    
    const Transactions = sequelize.define('transactions', {
        
        transactionId: {
            type: Sequelize.STRING,
            allowNull: false
        },
        type: {
            type: Sequelize.ENUM('credit', 'debit'),
            allowNull: false
        },
        narration: {
            type: Sequelize.STRING,
            allowNull: false
        },
        amount: {
            type: Sequelize.DOUBLE.UNSIGNED,
            allowNull: false
        },
        balance: {
            type: Sequelize.DOUBLE.UNSIGNED,
            allowNull: false
        },
        status: {
            type: Sequelize.ENUM('success', 'pending', 'failed'),
            defaultValue: 'success'
        },
        studentId: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        adminId: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
    }, {
        freezeTableName: true
    });

    Transactions.associate = function(models) {
        models.transactions.hasOne(models.orders, {onDelete: 'CASCADE',targetKey: "id", foreignKey: 'transactionId'});
        models.transactions.belongsTo(models.students, {onDelete: 'CASCADE',targetKey: "id", foreignKey: 'studentId'});
        models.transactions.belongsTo(models.admins, {onDelete: 'CASCADE',targetKey: "id", foreignKey: 'adminId'});
    };

    return Transactions;

}