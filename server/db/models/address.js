"use strict";

const mongoose = require('mongoose');
const {isPostalCode} = require('validator');

const AddressSchema = new mongoose.Schema({
  _creator: {
    type: String,
    required: true
  },  
  country: {
    type: String,
    required: true,
    trim: false,
    maxlength: 50
  },
  state: {
    type: String,
    required: false,
    trim: false,
    maxlength: 50
  },
  city: {
    type: String,
    required: false,
    trim: false,
    maxlength: 50
  },
  street: {
    type: String,
    required: false,
    trim: false,
    maxlength: 50
  },
  number: {
    type: Number,
    required: false,
    trim: false,
    maxlength: 6
  },
  floor: {
    type: Number,
    required: false,
    trim: false,
    maxlength: 6
  },
  door: {
    type: Number,
    required: false,
    trim: false,
    maxlength: 6
  },
  post_code: {
    type: String,
    required: false,
    trim: true,
    validate: {
        isAsync: true,
        validator: (code)=> isPostalCode(code, 'any'),
        message: '{VALUE} is not a valid phone post code or has a wrong region code.'
    }
  },
});

const Address = mongoose.model('Addresses', AddressSchema);

module.exports = {Address};