const {addressData, users} = require('./data/address_data');
const {Address} = require('../../../db/models/address');

const populateAddresses = async () => {
  try{
    await Address.remove({});
    await new Address({...addressData[0]}).save();
    await new Address({...addressData[1]}).save();
    await new Address({...addressData[2]}).save();
  } catch (err){
    throw new Error(err);
  }
};

module.exports = {
  populateAddresses, addressData, Address, users
};