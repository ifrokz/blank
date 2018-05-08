const router =  require('express').Router();
const {ObjectID} = require('mongodb');
const {pick} = require('lodash');

const {authenticate} =require('../../middleware/authenticate');
const {Phone} = require('../../db/models/phone');

router.post('/users/me/phone', authenticate, async(req,res)=>{
  try {
    const phone = new Phone({
      _creator: req.user._id,
      ...req.body
    });
    await phone.save();
    res.status(200).send({
      user: {
        _id: req.user._id,
        email: req.user.email
      },
      phone: {
        _id: phone._id
      }
    });
  } catch (e) {
    res.status(400).send(e);
  };
});

router.get('/users/me/phone/:id', authenticate, async(req, res) => {
  try {
    if(!ObjectID.isValid(req.params.id)){
       throw {
        error: {
          status: 400,
          error_message: 'Invalid ID.'
        }
      };
    };

    const phone = await Phone.findOne({
      _id: req.params.id,
      _creator: req.user._id
    });

    if(!phone){
      return res.status(404).send();
    };
    res.send(phone);
  } catch (e){
    res.status(400).send(e);
  };
});

router.get('/users/me/phone', authenticate, async(req, res) => {
  try {
    const phones = await Phone.find({
      _creator: req.user._id
    });

    if(phones.length === 0){
      return res.status(404).send();
    };

    res.send(phones);
  } catch (e){
    res.status(400).send(e);
  };
});

router.delete('/users/me/phone/:id', authenticate, async(req,res)=> {
  if(!ObjectID.isValid(req.params.id)){
    return res.status(400).send();
  };
  
  try{
    const phone = await Phone.findByIdAndRemove(req.params.id);
    if(!phone){
      return res.status(404).send()
    };
    res.send(phone);
  }catch(e){
    res.status(400).send(e);
  };
});

router.patch('/users/me/phone/:id', authenticate, async(req, res) => {
  if(!ObjectID.isValid(req.params.id)){
    return res.status(400).send();
  }

  try {
    const body = pick(req.body, ['code', 'number'])
    const phone = await Phone.findByIdAndUpdate(
      req.params.id,
      { ...body},
      {
        new: true,
        runValidators: true
    });
    if(!phone){
      return res.status(404).send();
    };
    res.send(phone)
  }catch (e) {
    res.status(400).send(e);
  };
});

module.exports = router;
