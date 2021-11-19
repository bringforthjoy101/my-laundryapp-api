/*************************************************************************
SERVICES TABLE
*************************************************************************/

module.exports = function(sequelize, Sequelize) {
    var Services = sequelize.define('services', {
        name: {
            type: Sequelize.STRING,
            allowNull: false
        },
        price: {
            type: Sequelize.DOUBLE.UNSIGNED,
            defaultValue: 0.00,
            allowNull: false
        },
        status: {
            type: Sequelize.ENUM('available', 'unavailable'),
            defaultValue: 'available'
        },
        
    }, {
        freezeTableName: true
    });

    Services.associate = function(models) {
        models.services.belongsTo(models.businesses, {onDelete: 'CASCADE',targetKey: "id", foreignKey: 'businessId'});
        models.services.belongsTo(models.users, {onDelete: 'CASCADE',targetKey: "id", foreignKey: 'userId'});
    };

    return Services;

}