"use strict";

const mongoose = require('mongoose');
const validator = require('validator');
const _ = require('lodash');

const {User} = require("./user");

const PersonalSchema = new mongoose.Schema({
    userId: {
        type: String,
        unique: true,
        index: true
        },
    name:{
        type: String,
        minlength: 2
    },
    secondName: {type: String, minlength: 2},
    phones:[{
        main_phone: {
            type: Boolean,
            required: false,
            default: false
        },
        code:  {
            type: String,
            required: true,
            trim: true
        },
        number: {
            type: String,
            required: true,
            trim: true,
            validate: {
                isAsync: true,
                validator: (phone)=> validator.isMobilePhone(phone, 'any', {strictMode: true}),
                message: '{VALUE} is not a valid phone number or has a wrong region code.'
            }
        }
    }],
    address: [{
        main_address: {
            default: false,
            type: Boolean,
            required: false
        },
        country: {
            type: String,
            required: true
        },
        state: {
            required: true,
            type: String
        },
        postCode: {
            type: String,
            required: true,
            // validator: {
            //     validate: validator.postCode
            // }
        },
        city: {
            type: String,
            required: true
        },
        street: {
            required: true,
            type: String
        },
        floor: {
            required: false,
            type: String
        },
        door: {
            type: String,
            required: true
        }
    }],
});

// phone:[{
//     code:  {
//         type: String,
//         required: true,
//         trim: true
//     },
//     number: {
//         type: String,
//         required: true,
//         trim: true,
//         validate: {
//             isAsync: true,
//             validator: (phone) => {
//                 validator.isMobilePhone(phone, 'any', {strictMode: true})
//             },
//             message: '{VALUE} is not a valid phone number'
//         }
//     }
// }],

PersonalSchema.statics.findByCreatedByUserId = async function(id) {
  const personal = this;
  let user, info;

  try {
    user = await User.findById(id);
  } catch (e) {
    return Promise.reject();
  };

  return user;
};

const Personal = mongoose.model('Personal' , PersonalSchema);

module.exports = {Personal}