/*************************************************************************
STOCKS TABLE
*************************************************************************/

module.exports = function(sequelize, Sequelize) {
    
    const Stocks = sequelize.define('stocks', {
        
        qty: {
            type: Sequelize.STRING,
            allowNull: false
        },
        oldPrice: {
            type: Sequelize.DOUBLE.UNSIGNED,
            allowNull: false
        },
        price: {
            type: Sequelize.DOUBLE.UNSIGNED,
            allowNull: false
        },
        status: {
            type: Sequelize.ENUM('active', 'expired'),
        },
        productId: {
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

    Stocks.associate = function(models) {
        models.stocks.belongsTo(models.products, {onDelete: 'CASCADE',targetKey: "id", foreignKey: 'productId'});
        models.stocks.belongsTo(models.admins, {onDelete: 'CASCADE',targetKey: "id", foreignKey: 'adminId'});
    };

    return Stocks;

}