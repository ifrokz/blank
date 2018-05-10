const {ObjectID} = require('mongodb');

const users = require('./user_data').users;

const IDs = [
  new ObjectID(),
  new ObjectID(),
  new ObjectID()
];

const addressData = [
   {    
      _id: IDs[0].toHexString(),
      _creator: users[0]._id.toHexString(),
      "country": "USA",
      "state": "Pensilvania",
      "post_code": "19019",
      "city": "Philadelphia",
      "street": "N 6th St",
      "number": 100,
      "floor": 6,
      "door": 23
    },
    {    _id: IDs[1].toHexString(),
      _creator: users[1]._id.toHexString(),
      "country": "Spain",
      "state": "C.Valenciana",
      "post_code": "46026",
      "city": "Valencia",
      "street": "C/Paco Pierra",
      "number":2,
      "floor": 1,
      "door": 3
    },
    {    _id: IDs[2].toHexString(),
      _creator: users[1]._id.toHexString(),
      country: "Spain",
      state: 'C.Valenciana',
      post_code: "46026",
      city: "Valencia",
      street: "C/ de Malilla",
      number: 92,
      floor: 6,
      door: 23
    }
];

module.exports = {
  users, addressData
}