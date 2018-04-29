"use strict";

const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');
const moment = require('moment');

const {User} = require('./../../../db/models/user');
const {genPayload} = require('./../../../db/models/utils/user_utils');

const userOneId = new ObjectID();
const userTwoId = new ObjectID();
const userThreeId = new ObjectID();

const users = [
    {
        _id: userOneId,
        email: 'test@test.com',
        password: 'userOnePass',
        tokens: [{
            access: 'auth',
            token: jwt.sign({...genPayload({access: 'auth', _id: userOneId})}, process.env.JWT_SECRET).toString()
        }]
    },
    {
        _id: userTwoId,
        email: 'admin@test.com',
        password: 'userTwoPass',
        tokens: [{
            access: 'auth',
            token: jwt.sign({...genPayload({access: 'auth', _id: userTwoId})}, process.env.JWT_SECRET).toString()
        }]
    },
    {
        _id: userThreeId,
        email: 'help@test.com',
        password: 'userThreePass',
        tokens: [{
            access: 'auth',
            token: jwt.sign({...genPayload({access: 'auth', _id: userThreeId})}, process.env.JWT_SECRET).toString()
        }]
    }   
];

const populateUsers = async () => {
    try{ 
        await User.remove({}); 
        const userOne = await new User(users[0]).save();
        const userTwo = await new User(users[1]).save();
        const userThree = await new User(users[2]).save();
    } catch (err) {
        throw new Error(err);
    };
};

module.exports = {
    populateUsers, users
};