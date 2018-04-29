"use strict";

const router = require('express').Router();
const _ = require('lodash');

const {User} = require('./../db/models/user');
const {authenticate} = require('./../middleware/authenticate');

router.post('/users/register', async (req, res) => {
  console.log(req.body);
  try{
      const user  = await new User(req.body).save();
      const token = await user.generateAuthToken();
      res.header('x-auth', token).send(user);
  } catch (e) {
      res.status(400).send(e);
  };
});

router.post('/users/login', async (req, res) => {
  try {
      const body = _.pick(req.body, ['email', 'password']);

      if(_.isEmpty(body)){
          throw new Error();
      };
      const user = await User.findByCredentials(body.email, body.password);
      const token = await user.generateAuthToken();
      res.header('x-auth', token).send(user);
  } catch (e) {
      res.status(400).send();
  };
});

router.get('/users/me', authenticate, (req, res) => {
  res.send(req.user);
});

router.delete('/users/me/token', authenticate, async (req, res)=>{
    try {
        await req.user.removeToken(req.token);
        res.status(200).send();
    } catch (err) {
        res.status(400).send();
    };
});


module.exports = router;

