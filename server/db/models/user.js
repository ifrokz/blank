"use strict";

const mongoose = require('mongoose');
const {isEmail} = require('validator');
const {sign, verify} = require('jsonwebtoken');
const {pick} = require('lodash');
const {compare, genSalt, hash} = require('bcrypt');

const {genPayload} = require('./utils/user_utils');

const {PersonalSchema, personalObject} = require('./personal');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        minlength: 1,
        trim: true,
        unique: true,
        validate: {
            isAsync: true,
            validator: (email)=> isEmail(email),
            message: '{VALUE} is not a valid email.'
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }],
    personal: {...personalObject}
});

UserSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject();

    return pick(userObject, ['_id', 'email']);
};

UserSchema.methods.generateAuthToken = function () {
    const user = this;
    const access = 'auth';
    const token = sign(genPayload({_id: user._id, access}), process.env.JWT_SECRET).toString();

    user.tokens.push({access,token});

    return user.save().then(()=>{
        return token;
    });
};

UserSchema.methods.removeToken = function (token) {
    const user = this;

    return user.update({
        $pull: {
            tokens: {token}
        }
    });
};

UserSchema.statics.findByToken = function (token){
    const User = this;
    let decoded = undefined;

    try {
        decoded = verify(token, process.env.JWT_SECRET);
    } catch (e) {
        return Promise.reject();
    };

    return User.findOne({
        _id: decoded._id,
        'tokens.token': token,
        'tokens.access': 'auth'
    });
};

UserSchema.statics.findByCredentials = async function (email, password) {
    const user = this;

    return User.findOne({email}).then(user=> {
        if(!user) {
            return Promise.reject();
        };

        return new Promise((resolve, reject)=>{
            compare(password, user.password, (err, res) => {
                if(res){
                    resolve(user);
                }else{
                    reject();
                };
            });
        });
    });
};

UserSchema.statics.updatePersonalInfo = async function (info) {
    const {name, lastName, phones} = {...info};
}

UserSchema.pre('save', function(next){
    const user = this;
    const saltRounds = process.env.NODE_ENV === 'test' ? 1 : 10;
    if(user.isModified('password')){
        genSalt(saltRounds, (err, salt) => {
            hash(user.password, salt, (err, hashedPassword) => {
                compare(user.password, hashedPassword, (err, res) => {
                    user.password = hashedPassword;
                    next();
                });
            })
        }); 
    } else {
        next();
    };
});

const User = mongoose.model('Users' , UserSchema);


module.exports = {User};