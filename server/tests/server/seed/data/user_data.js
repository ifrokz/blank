const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');

const {genPayload} = require('./../../../../db/models/utils/user_utils');
const personalData = require('./personal_data').personalData;

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
        }],
        personal: {...personalData[0]}
    },
    {
        _id: userTwoId,
        email: 'admin@test.com',
        password: 'userTwoPass',
        tokens: [{
            access: 'auth',
            token: jwt.sign({...genPayload({access: 'auth', _id: userTwoId})}, process.env.JWT_SECRET).toString()
        }],
        personal: {...personalData[1]}
    },
    {
        _id: userThreeId,
        email: 'help@test.com',
        password: 'userThreePass',
        tokens: [{
            access: 'auth',
            token: jwt.sign({...genPayload({access: 'auth', _id: userThreeId})}, process.env.JWT_SECRET).toString()
        }],
        personal: {...personalData[2]}
    }   
];

module.exports ={
    personalData, users
};