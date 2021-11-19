/*************************************************************************
PDFS TABLE
*************************************************************************/

module.exports = function(sequelize, Sequelize) {
    
    const Pdfs = sequelize.define('pdfs', {
        
        pdf: {
            type: Sequelize.STRING,
            allowNull: false
        }
    }, {
        freezeTableName: true
    });

    Pdfs.associate = function(models) {
        models.pdfs.belongsTo(models.orders, {onDelete: 'CASCADE',targetKey: "id", foreignKey: 'orderId'});
    };

    return Pdfs;

}