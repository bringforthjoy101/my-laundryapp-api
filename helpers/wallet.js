// const sequelize, {QueryTypes} = require("sequelize");
const DB = require("../controllers/db");

const getStudentWalletBalance = async (studentId) => {
    const student = await DB.students.findOne({ where: { id: studentId } });
    return student.wallet;
}

const updateWallet = async ({transactionId, studentId, amount, narration, type}) => {
    console.log(transactionId);
    let balance = await getStudentWalletBalance(studentId);
    
    if (type == "credit") {
      const sql = `UPDATE students SET wallet = (students.wallet + ?) WHERE id = ?`;
      try {
        await DB.sequelize.query(sql,{ replacements: [Number(amount), studentId], type: DB.sequelize.QueryTypes.UPDATE })
        balance = await getStudentWalletBalance(studentId);
      } catch (error) {
        console.log(error);
        return {status: false, message: 'An error occured!'}
      }
    } else {
      if (amount > balance)
        return {status: false, message: 'Insuficient balance in student wallet'}
      const sql = `UPDATE students SET wallet = (students.wallet - ?) WHERE id = ?`;
      try {
        await DB.sequelize.query(sql,{ replacements: [Number(amount), studentId], type: DB.sequelize.QueryTypes.UPDATE })
        balance = await getStudentWalletBalance(studentId);
      } catch (error) {
        console.log(error);
        return {status: false, message: 'An error occured!'}
      }
    }
    
    const users_transactions_data = {
      transactionId,
      amount,
      balance,
      type,
      narration,
      studentId
    };
    const transaction = await DB.transactions.create(users_transactions_data);
    if (transaction)
      return {status: true, message: 'Wallet Updated!', id: transaction.id}
}

module.exports = {
    updateWallet, getStudentWalletBalance
}