const {ObjectID} = require('mongodb');

module.exports.personalData = [
  {
    name: "Ivan",
    secondName: "Ruiz Rosello",
    phone: {
      code: "es-ES",
      number: "+34605842890"
    },
    address: {
      country: "Spain",
      state: 'C.Valenciana',
      postCode: "46026",
      city: "Valencia",
      street: "C/ de Malilla",
      number: '92',
      floor: "6",
      door: '23'
    }
  },
  {
    "name": "Andrew",
    "secondName": "Mead Mead",
    "phone": {
      "code": "us-US",
      "number": "212-228-7888"
    },
    "address": {
      "country": "USA",
      "state": "Pensilvania",
      "postCode": "19019",
      "city": "Philadelphia",
      "street": "N 6th St",
      "number": '100',
      "floor": "6",
      "door": '23'
    }
  },
  {
    "name": "Pablo",
    "secondName": "Tolosa Cerezo",
    "phone": {
      "code": "es-ES",
      "number": "+34675667896"
    },
    "address": {
      "country": "Spain",
      "state": "C.Valenciana",
      "postCode": "46026",
      "city": "Valencia",
      "street": "C/Paco Pierra",
      "number":'2',
      "floor": "1",
      "door": '3'
    }
  }
];