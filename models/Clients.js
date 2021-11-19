/*************************************************************************
CLIENTS TABLE
*************************************************************************/

module.exports = function(sequelize, Sequelize) {
    var Clients = sequelize.define('clients', {
        names: {
            type: Sequelize.STRING,
            allowNull: false
        },
        location: {
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

    Clients.associate = function(models) {
        models.clients.hasMany(models.orders, {onDelete: 'cascade',targetKey: "id", foreignKey: 'clientId'});
        models.clients.belongsTo(models.businesses, {onDelete: 'CASCADE',targetKey: "id", foreignKey: 'businessId'});
        models.clients.belongsTo(models.users, {onDelete: 'CASCADE',targetKey: "id", foreignKey: 'userId'});
    };

    return Clients;

}