/*************************************************************************
STUDENTS TABLE
*************************************************************************/

module.exports = function(sequelize, Sequelize) {
    var Students = sequelize.define('students', {
        firstName: {
            type: Sequelize.STRING,
            allowNull: false
        },
        lastName: {
            type: Sequelize.STRING,
            allowNull: false
        },
        otherName: {
            type: Sequelize.STRING
        },
        type: {
            type: Sequelize.ENUM('boarding', 'day'),
            defaultValue: 'boarding'
        },
        class: {
            type: Sequelize.ENUM('senior', 'junior'),
            defaultValue: 'junior'
        },
        level: {
            type: Sequelize.ENUM('1', '2', '3'),
            defaultValue: '1'
        },
        group: {
            type: Sequelize.STRING
        },
        wallet: {
            type: Sequelize.DOUBLE.UNSIGNED,
            defaultValue: 0
        },
        avatar: {
            type: Sequelize.STRING,
            allowNull: false
        },
        role: {
            type: Sequelize.ENUM('student', 'kitchen'),
            defaultValue: 'student'
        },
        status: {
            type: Sequelize.ENUM('active', 'suspended', 'expelled', 'graduated'),
            defaultValue: 'active'
        },
    }, {
        freezeTableName: true
    });

    Students.associate = function(models) {
        models.students.hasMany(models.orders, {onDelete: 'cascade',targetKey: "id", foreignKey: 'studentId'});
        models.students.hasMany(models.transactions, {onDelete: 'cascade',targetKey: "id", foreignKey: 'studentId'});
    };

    return Students;

}