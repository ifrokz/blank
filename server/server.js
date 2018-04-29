"use strict";

require('./config/config.js');

const bodyParser = require('body-parser')
const {mongoose}  = require('./db/mongoose');
const express = require('express')
const _ = require('lodash');

const {User} = require('./db/models/user');
const {authenticate} = require('./middleware/authenticate');

const app = express();

app.use(bodyParser.json());

app.get('/', (req, res) => {
    const user = new User({email: 'iffassds@afda.ads', password: 'fal;kseh'});
    user.save().then(user=>{
        res.send(user);
        console.log(user);
    }).catch(e=>{console.log(e)});
});

app.post('/users/register', async (req, res)=>{
    try{
        const user  = await new User(req.body).save();
        const token = await user.generateAuthToken();
        res.header('x-auth', token).send(user);
    } catch (e) {
        res.status(400).send(e);
    };
});

app.post('/users/login', async (req, res) => {
    try {
        const body = _.pick(req.body, ['email', 'password']);

        if(_.isEmpty(body)){
            throw new Error();
        }
        const user = await User.findByCredentials(body.email, body.password);
        const token = await user.generateAuthToken();
        res.header('x-auth', token).send(user);
    } catch (e) {
        res.status(400).send();
    };
});

app.get('/users/me', authenticate, (req, res) => {
    res.send(req.user);
});

app.delete('/users/me/token', authenticate, async (req, res)=>{
    try {
        await req.user.removeToken(req.token);
        res.status(200).send();
    } catch (err) {
        res.status(400).send();
    }
});

app.listen(process.env.PORT, () => {
    console.log(`Started on port ${process.env.PORT}`);
});

module.exports = {app};