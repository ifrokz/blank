"use strict";

const {User} = require('./../../../db/models/user');
const {users, personalData} = require('./data/user_data');

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
    populateUsers, users, personalData
};