const mongoose = require('mongoose');
const {isMobilePhone} = require('validator');

const PhoneSchema = new mongoose.Schema({
  _creator: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true,
    trim: true,
    minlength: 5,
    maxlength: 5
  },
  number: {
    type: String,
    required: false,
    trim: true,
    validate: {
        isAsync: true,
        validator: (phone)=> isMobilePhone(phone, 'any', {strictMode: false}),
        message: '{VALUE} is not a valid phone number or has a wrong region code.'
    }
  },
  main_phone: {
    type: Boolean,
    required: true,
    default: false
  }
});

const Phone = mongoose.model('Phones', PhoneSchema);

module.exports = {Phone};