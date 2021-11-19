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
          body('phone').not().isEmpty().isString().withMessage('Phone is required!')
        ]   
    }
    case '/login': {
      return [
          body('email').not().isEmpty().isString().withMessage('Email is required!'),
          body('password').not().isEmpty().isString().withMessage('Password is required!')
      ]
    }
    case '/change-password': {
      return [
          body('email').not().isEmpty().isString().withMessage('Email is required!'),
          body('oldPassword').not().isEmpty().isString().withMessage('Old password is required!'),
          body('newPassword').not().isEmpty().isString().withMessage('New password is required!'),
      ]
    }

    case 'id': {
      return [
          param('id').isInt().withMessage('ID must be a number!')
      ]
    }

    // Products validations
    case '/services/create': {
      const validUnit = ['kg', 'pck', 'pcs', 'l', 'tuber', 'g', 'rubber', 'bunch', 'crate', 'carton'];
      const validCategory = ['shop', 'book', 'store'];
      return [
          body('name').not().isEmpty().isString().withMessage('name is required!')
          // body('price').optional().not().isEmpty().custom(value => { return Number(value) }).withMessage('price is required!'),
      ]
    }
    case '/services/update': {
      return [
          param('id').isInt().withMessage('ID must be a number!'),
          body('name').optional().isString().withMessage('name must be a string'),
          // body('price').optional().custom(value => { return Number(value) }).withMessage('price is required!'),
          body('status').optional().custom(value => { return ['available', 'unavailable'].includes(value) }).withMessage('status can only be available or unavailable!')
      ]
    }

    case '/orders/create': {
      return [
          // body('amount').custom(value => { return Number(value) }).withMessage('amount is required!'),
          body('services').custom(value => { return Array.isArray(value) }).withMessage('services must be an array of objects'),
          body('clientId').custom(value => { return Number(value) }).withMessage('clientId is required!')
      ]
    }

    case '/orders/update': {
      return [
          param('id').isInt().withMessage('ID must be a number!'),
          body('status').optional().custom(value => { return ['paid', 'unpaid'].includes(value) }).withMessage('status can only be paid or unpaid!')
      ]
    }
    
    case '/clients/create': {
      return [
          body('names').not().isEmpty().isString().withMessage('names is required!'),
          body('location').not().isEmpty().isString().withMessage('location is required!'),
          body('phone').optional().isString().withMessage('phone is required!')
      ]
    }
    case '/clients/update': {
      return [
          param('id').isInt().withMessage('ID must be a number!'),
          body('names').optional().not().isEmpty().isString().withMessage('names is required!'),
          body('location').optional().not().isEmpty().isString().withMessage('location is required!'),
          body('phone').optional().isString().withMessage('phone is required!'),
          body('status').optional().custom(value => { return ['active', 'inactive'].includes(value) }).withMessage('status can only be active or inactive!')
      ]
    }

    case '/businesses/create': {
      return [
          body('name').not().isEmpty().isString().withMessage('name is required!'),
          body('address').not().isEmpty().isString().withMessage('address is required!'),
          body('logo').not().isEmpty().isString().withMessage('logo is required!'),
          body('email').not().isEmpty().isString().withMessage('email is required!'),
          body('phone').optional().isString().withMessage('phone is required!'),
          body('bankName').not().isEmpty().isString().withMessage('bankName is required!'),
          body('bankAccountNumber').not().isEmpty().isString().withMessage('bankAccountNumber is required!'),
          body('accountName').not().isEmpty().isString().withMessage('accountName is required!'),
      ]
    }
    case '/businesses/update': {
      return [
          param('id').isInt().withMessage('ID must be a number!'),
          body('name').optional().not().isEmpty().isString().withMessage('name is required!'),
          body('address').optional().not().isEmpty().isString().withMessage('address is required!'),
          body('logo').optional().not().isEmpty().isString().withMessage('logo is required!'),
          body('email').optional().not().isEmpty().isString().withMessage('email is required!'),
          body('phone').optional().isString().withMessage('phone is required!'),
          body('bankName').optional().not().isEmpty().isString().withMessage('bankName is required!'),
          body('bankAccountNumber').optional().not().isEmpty().isString().withMessage('bankAccountNumber is required!'),
          body('accountName').optional().not().isEmpty().isString().withMessage('accountName is required!'),
          body('status').optional().custom(value => { return ['active', 'inactive'].includes(value) }).withMessage('status can only be active or inactive!')
      ]
    }

    
  }
}