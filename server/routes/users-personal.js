"use sctric";

const router = require('express').Router();
const _ = require('lodash');

const {authenticate} = require('./../middleware/authenticate');
const {User} = require('../db/models/user');

router.post('/users/personal/update', authenticate, async (req, res) => {

  try {
    const user = await Personal.findByCreatedByUserId(req.user._id);
    res.send(user);
  } catch (e){
    res.status(409).send(e);
    console.log(e)
  };

});

router.post('/users/personal/create', authenticate, async (req, res) => {
  try {  
    let data = _.pick(req.body, ['name','secondName','addresses']);
    data.userId = req.user._id;
    data.phones = [];
    req.body.phones.forEach(phone => {
      data.phones.push(phone);
    });
    
    let user = await User.findById(req.user._id);
    user.personal = data;
    await user.save();

    res.send(user);
  }catch (e){
    res.status(400).send(e);
  };
});

module.exports = router;