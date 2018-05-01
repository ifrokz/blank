"use sctric";

const router = require('express').Router();
const _ = require('lodash');

const {Personal} = require('./../db/models/personal');
const {authenticate} = require('./../middleware/authenticate');

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
    let data = _.pick(req.body, ['name','address']);
    data.userId = req.user._id;
    data.phones = [];
    req.body.phones.forEach(phone => {
      data.phones.push(phone);
    });
    console.log(data)
    const personal = await new Personal({...data}).save();
    res.send(personal);
  }catch (e){
    res.status(400).send(e);
  };
});

module.exports = router;