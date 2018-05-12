"use strict";

const {ObjectID} = require('mongodb');

const users = require('./user_data').users;

const IDs = [
  new ObjectID(),
  new ObjectID(),
  new ObjectID()
];

const phonesData = [
  {
    _id: IDs[0].toHexString(),
    _creator: users[0]._id.toHexString(),
    code: "es-ES",
    number: "+34605842890",
    selected_default: false
  },
  {
    _id: IDs[1].toHexString(),
    _creator: users[1]._id.toHexString(),
    code: "es-ES",
    number: "+34675667896",
    selected_default: true
  },
  {
    _id: IDs[2].toHexString(),
    _creator: users[1]._id.toHexString(),
    code: "us-US",
    number: "212-228-7888",
    selected_default: false
  }
];

module.exports = {phonesData, users};