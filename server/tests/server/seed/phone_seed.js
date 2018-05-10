"use strict";

const {phonesData, users} = require('./data/phone_data');
const {Phone} = require('../../../db/models/phone');

const populatePhones = async () => {
  try{
    await Phone.remove({});
    await new Phone({...phonesData[0]}).save();
    await new Phone({...phonesData[1]}).save();
    await new Phone({...phonesData[2]}).save();
  } catch (err){
    throw new Error(err);
  }
};

module.exports = {
  populatePhones, phonesData, Phone, users
};