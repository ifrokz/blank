"use strict";

const router =  require('express').Router();
const {ObjectID} = require('mongodb');
const {pick} = require('lodash');

const {authenticate} =require('../../middleware/authenticate');
const {Address} = require('./../../db/models/address');

router.post('/users/me/address', authenticate, async(req,res)=>{
  try {
    const address = new Address({
      _creator: req.user._id,
      ...req.body
    });
    await address.save();
    res.status(200).send({
      user: {
        _id: req.user._id,
        email: req.user.email
      },
      address: {
        _id: address._id
      }
    });
  } catch (e) {
    res.status(400).send(e);
  };
});

router.get('/users/me/address', authenticate, async(req,res)=>{
  try {
    const addresses = await Address.find({
      _creator: req.user._id
    });

    if(addresses.length === 0){
      return res.status(404).send();
    };

    res.send(addresses);
  } catch (e){
    res.status(400).send(e);
  };
});

router.get('/users/me/address/:id', authenticate, async(req,res)=>{
  try {
    if(!ObjectID.isValid(req.params.id)){
       throw {
        error: {
          status: 400,
          error_message: 'Invalid ID.'
        }
      };
    };

    const address = await Address.findOne({
      _id: req.params.id,
      _creator: req.user._id
    });

    if(!address){
      return res.status(404).send();
    };
    res.send(address);
  } catch (e){
    res.status(400).send(e);
  };
});

router.delete('/users/me/address/:id', authenticate, async(req,res)=>{
  if(!ObjectID.isValid(req.params.id)){
    return res.status(400).send();
  };
  
  try{
    const address = await Address.findByIdAndRemove(req.params.id);
    if(!address){
      return res.status(404).send()
    };
    res.send(address);
  }catch(e){
    res.status(400).send(e);
  };
});

router.patch('/users/me/address/:id', authenticate, async(req,res)=>{
  if(!ObjectID.isValid(req.params.id)){
    return res.status(400).send();
  }

  try {
    const body = pick(req.body, ['country', 'state', 'post_code', 'city', 'street', 'number', 'floor', 'door']);
    const address = await Address.findByIdAndUpdate(req.params.id,
    {
      ...body
    },{
      new: true,
      runValidators: true
    });
    res.send(address);
  }catch (e) {
    res.status(400).send(e);
  };
});

module.exports = router;
