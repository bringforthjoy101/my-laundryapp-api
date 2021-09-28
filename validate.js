const { body, param } = require('express-validator')

exports.validate = (method) => {
  switch (method) {
    // Send contact mail
    
    case '/send/contact': {
      return [ 
          body('name').not().isEmpty().isString().withMessage('Name is required!'),
          body('email').not().isEmpty().isString().withMessage('Email is required!'),
          body('phone').not().isEmpty().isString().withMessage('Phone is required!'),
          body('subject').not().isEmpty().isString().withMessage('Subject is required!'),
          body('message').not().isEmpty().isString().withMessage('Message is required!')
        ]   
    }
    case '/subscribe': {
      return [ 
          body('firstName').not().isEmpty().isString().withMessage('Firstname is required!'),
          body('lastName').not().isEmpty().isString().withMessage('Lastname is required!'),
          body('email').not().isEmpty().isString().withMessage('Email is required!')
        ]   
    }

    case '/register': {
      return [ 
          body('firstName').not().isEmpty().isString().withMessage('Firstname is required!'),
          body('lastName').not().isEmpty().isString().withMessage('Lastname is required!'),
          body('email').not().isEmpty().isString().withMessage('Email is required!'),
          body('password').not().isEmpty().isString().withMessage('Password is required!'),
          body('phone').not().isEmpty().isString().withMessage('Phone is required!'),
          body('role').custom(value => { return ['manager', 'busary', 'sales rep'].includes(value) }).withMessage('role can only be manager, busary or sales rep!')
        ]   
    }
    case '/login': {
      return [
          body('email').not().isEmpty().isString().withMessage('Email is required!'),
          body('password').not().isEmpty().isString().withMessage('Password is required!')
      ]
    }

    case 'id': {
      return [
          param('id').isInt().withMessage('ID must be a number!')
      ]
    }

    // Products validations
    case '/products/create': {
      const validUnit = ['kg', 'pck', 'pcs', 'l', 'tuber', 'g', 'rubber', 'bunch', 'crate', 'carton'];
      const validCategory = ['shop', 'book', 'store'];
      return [
          body('name').not().isEmpty().isString().withMessage('name is required!'),
          body('description').not().isEmpty().isString().withMessage('description is required!'),
          body('qty').optional().custom(value => { return Number(value) }).withMessage('qty is required!'),
          body('unit').custom(value => { return validUnit.includes(value) }).withMessage(`unit can only be ${validUnit}!`),
          body('category').custom(value => { return validCategory.includes(value) }).withMessage(`category can only be ${validCategory}!`),
          body('price').optional().not().isEmpty().custom(value => { return Number(value) }).withMessage('price is required!'),
          body('image').not().isEmpty().isString().withMessage('image is required!')
      ]
    }
    case '/products/update': {
      const validUnit = ['kg', 'pck', 'pcs', 'l', 'tuber', 'g', 'rubber', 'bunch', 'crate', 'carton'];
      const validCategory = ['shop', 'book', 'store'];
      return [
          param('id').isInt().withMessage('ID must be a number!'),
          body('name').optional().isString().withMessage('name must be a string'),
          body('description').optional().isString().withMessage('description is required!'),
          body('qty').optional().custom(value => { return Number(value) }).withMessage('qty is required!'),
          body('unit').optional().custom(value => { return validUnit.includes(value) }).withMessage(`unit can only be ${validUnit}!`),
          body('category').optional().custom(value => { return validCategory.includes(value) }).withMessage(`category can only be ${validCategory}!`),
          body('price').optional().custom(value => { return Number(value) }).withMessage('price is required!'),
          body('image').optional().not().isEmpty().isString().withMessage('image is required!'),
          body('status').optional().custom(value => { return ['in stock', 'out of stock'].includes(value) }).withMessage('status can only be in stock or out of stock!')
      ]
    }

    case '/orders/create': {
      return [
          body('amount').custom(value => { return Number(value) }).withMessage('amount is required!'),
          body('products').custom(value => { return Array.isArray(value) }).withMessage('products must be an array of objects'),
          body('studentId').custom(value => { return Number(value) }).withMessage('studentId is required!')
      ]
    }
    
    case '/students/create': {
      return [
          body('firstName').not().isEmpty().isString().withMessage('firstName is required!'),
          body('lastName').not().isEmpty().isString().withMessage('lastName is required!'),
          body('otherName').optional().isString().withMessage('otherName is required!'),
          body('type').custom(value => { return ['boarding', 'day'].includes(value) }).withMessage('type can only be boarding or day!'),
          body('className').custom(value => { return ['senior', 'junior'].includes(value) }).withMessage('className can only be junior or senior!'),
          body('level').custom(value => { return ['1', '2', '3'].includes(value) }).withMessage('level can only be 1, 2 or 3!'),
          body('group').not().isEmpty().isString().withMessage('group is required!'),
          body('avatar').isString().withMessage('avatar is required!')
      ]
    }
    case '/students/wallet': {
      return [
          body('narration').not().isEmpty().isString().withMessage('narration is required!'),
          body('amount').custom(value => { return Number(value) }).withMessage('amount is required!'),
          body('studentId').custom(value => { return Number(value) }).withMessage('studentId is required!'),
          body('type').custom(value => { return ['credit', 'debit'].includes(value.toLowerCase()) }).withMessage('type can only be credit or debit!')
      ]
    }
    case '/students/update': {
      return [
          param('id').isInt().withMessage('ID must be a number!'),
          body('firstName').optional().isString().withMessage('firstName is required!'),
          body('lastName').optional().isString().withMessage('lastName is required!'),
          body('otherName').optional().isString().withMessage('otherName is required!'),
          body('type').optional().custom(value => { return ['boarding', 'day'].includes(value) }).withMessage('type can only be boarding or day!'),
          body('className').optional().custom(value => { return ['senior', 'junior'].includes(value) }).withMessage('className can only be junior or senior!'),
          body('level').optional().custom(value => { return [1, 2, 3].includes(Number(value)) }).withMessage('level can only be 1, 2 or 3!'),
          body('group').optional().isString().withMessage('group is required!'),
          body('avatar').optional().isString().withMessage('avatay is required!'),
          body('wallet').optional().custom(value => { return Number(value) }).withMessage('wallet is required!'),
          body('status').optional().custom(value => { return ['active', 'suspended', 'expelled', 'graduated'].includes(value) }).withMessage('status can only be active, suspended, expelled, graduated!')
      ]
    }

    
  }
}