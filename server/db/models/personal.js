"use strict";

const {isMobilePhone} = require('validator');

module.exports.personalObject = {
    name:{
        type: String,
        minlength: 2
    },
    secondName: {type: String, minlength: 2},
    address: {
        country: {
            type: String,
            required: false
        },
        state: {
            required: false,
            type: String
        },
        postCode: {
            type: String,
            required: false,
            validator: {
                isAsync: true,
                validate: (code) => validator.postCode(code, 'any'),
                message: '{VALUE} is not a valid post code'
            }
        },
        city: {
            type: String,
            required: false
        },
        street: {
            required: false,
            type: String
        },
        number: {
            required: false,
            type: String
        },
        floor: {
            required: false,
            type: String
        },
        door: {
            type: String,
            required: false
        }
    },
};

