/*************************************************************************
PRODUCTS TABLE
*************************************************************************/

module.exports = function(sequelize, Sequelize) {
    var Products = sequelize.define('products', {
        name: {
            type: Sequelize.STRING,
            allowNull: false
        },
        description: {
            type: Sequelize.TEXT,
            allowNull: false
        },
        price: {
            type: Sequelize.DOUBLE.UNSIGNED,
            defaultValue: 0.00,
            allowNull: false
        },
        image: {
            type: Sequelize.STRING
        },
        qty: {
            type: Sequelize.INTEGER.UNSIGNED,
            defaultValue: 0,
            allowNull: false
        },
        status: {
            type: Sequelize.ENUM('in stock', 'out of stock'),
            defaultValue: 'out of stock'
        },
        adminId: {
            type: Sequelize.INTEGER
        }
        
    }, {
        freezeTableName: true
    });

    Products.associate = function(models) {
        models.products.belongsTo(models.admins, {onDelete: 'CASCADE',targetKey: "id", foreignKey: 'adminId'});
    };

    return Products;

}