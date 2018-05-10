"use strict";

const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');
const {pick} = require('lodash');

const {app} = require('./../../server.js');
const {populateAddresses, addressData, Address, users} = require('./seed/address_seed');

beforeEach(populateAddresses);


describe('Servers.js /users/me/address/**', () => {
  describe('POST /users/me/address', () => {
    it('should save a new address', (done) => {
      const tempAddress = {
        country: "Spain",
        state: "C.Valenciana",
        post_code: "46026",
        city: "Valencia",
        street: "Carrer de Malilla",
        number: 92,
        floor: 6,
        door: 23
      };
  
      request(app)
        .post('/users/me/address')
        .set('x-auth', users[0].tokens[0].token)
        .send({...tempAddress})
        .expect(200)
        .expect((res)=>{
          expect(res.body.user).toMatchObject({_id: users[0]._id.toHexString(), email: users[0].email});
          expect(res.body.address._id).toBeTruthy();
        })
        .end(async(err, res) => {
          if(err){
            return done(err);
          };
  
          try{ 
            const address = await Address.findById(res.body.address._id);
            expect(address).toMatchObject({...tempAddress});
            done();
          } catch (err) {
            done(err)
          };
        });
    });

    it('should return 400 if wrong data or inexistent', (done) => {
      request(app)
        .post('/users/me/address')
        .set('x-auth', users[0].tokens[0].token)
        .send({
          _creator: users[1]._id.toHexString(),
          code: '@#',
          number: 'nothing'
        })
        .expect(400)
        .end(done);
    });

    it('should return 401 if unauthorized',(done)=>{
      request(app)
        .post('/users/me/address')
        .expect(401)
        .end(done);
    });
  });

  
  describe('DELETE /users/me/address/:id', () => {
    it('should remove a address if authenticated and address exists', (done) => {
      request(app)
        .delete(`/users/me/address/${addressData[0]._id}`)
        .set('x-auth', users[0].tokens[0].token)
        .expect(200)
        .end(done);
    });

    it('should return 404 if not found', (done) => {
      request(app)
        .delete(`/users/me/address/${addressData[2]._id}`)
        .set('x-auth', users[0].tokens[0].token)
        .expect(200)
        .end(done);
    });

    it('should return 400 if id is invalid', (done) => {
      request(app)
        .delete(`/users/me/address/${addressData[2]._id+1}`)
        .set('x-auth', users[0].tokens[0].token)
        .expect(400)
        .end(done);
    });

    it('should return 401 if unauthorized',(done)=>{
      request(app)
        .delete(`/users/me/address/${addressData[0]._id}`)
        .expect(401)
        .end(done);
    });
  });

  describe('PATCH /users/me/address/:id', () => {
    it('should patch address by id', (done)=>{
      let tempAddress = {
          country: "Spain",
          state: "C.Valenciana",
          postCode: "46026",
          city: "Valencia",
          street: "Carrer de Malilla",
          number: 92,
          floor: 6,
          door: 23
      }

      request(app)
      .patch(`/users/me/address/${addressData[0]._id}`)
      .set('x-auth', users[0].tokens[0].token)
      .send({
        ...tempAddress
      })
      .expect(200)
      .expect((res)=>{
        expect(tempAddress).toMatchObject(pick(res.body, ['code', 'number', 'main_address']));
        tempAddress = res.body;
      })
      .end(async(err,res)=>{
        if(err){
          return done(err);
        };

        try{
          const address = await Address.findById(res.body._id);
          expect({
            ...address.toObject(),
            _id: address._id.toHexString()
          }).toMatchObject({...tempAddress})
          done();
        }catch(e){
          done(e);
        };
      });
    });
    
    it('should return 401 if unauthorized',(done)=>{
      request(app)
        .patch(`/users/me/address/${addressData[0]._id}`)
        .expect(401)
        .end(done);
    });

    it('should return 400 if id is invalid', (done) => {
      request(app)
        .patch(`/users/me/address/${addressData[2]._id+1}`)
        .set('x-auth', users[0].tokens[0].token)
        .expect(400)
        .end(done);
    });

    it('should return 404 if not found', (done) => {
      request(app)
        .patch(`/users/me/address/${addressData[2]._id}`)
        .set('x-auth', users[0].tokens[0].token)
        .expect(200)
        .end(done);
    });
  });

  describe('GET /users/me/address/:id', () => {
    it('should return address data by ID', (done) => {
      request(app)
        .get(`/users/me/address/${addressData[0]._id}`)
        .set('x-auth', users[0].tokens[0].token)
        .expect(200)
        .end((err, res)=>{
          if(err){
            return done(err);
          }
          expect(res.body).toMatchObject(addressData[0])
          done();
      });
    });

    it('should return 400 if wrong data', (done) => {
      request(app)
        .get(`/users/me/address/${addressData[0]._id+1}`)
        .set('x-auth', users[0].tokens[0].token)
        .expect(400)
        .end((err, res)=>{
          if(err){
            return done(err);
          }
          expect(res.body).toMatchObject({
            error: {
              status: 400,
              error_message: 'Invalid ID.'
            }
          })
          done();
      });
    });

    it('should return 404 if not found', (done) => {
      request(app)
      .get(`/users/me/address/${new ObjectID().toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
    });

    it('should return 401 if unauthorized',(done)=>{
      request(app)
        .get('/users/me/address/:id')
        .expect(401)
        .end(done);
    });
  });

  describe('GET /users/me/address/', () => {
    it('should return a array of address by creator _id', (done) => {
      request(app)
        .get('/users/me/address')
        .set('x-auth', users[0].tokens[0].token)
        .expect(200)
        .expect(res=>{
          expect(res.body[0]).toMatchObject(addressData[0]);
          expect(res.body.length).toBe(1);
        })
        .end(done);
    });

    it('should return 404 if no addresses found', (done) => {
      request(app)
        .get('/users/me/address')
        .set('x-auth', users[2].tokens[0].token)
        .expect(404)
        .end(done)
    });

    it('should return 401 if unauthorized',(done)=>{
      request(app)
        .get('/users/me/address')
        .expect(401)
        .end(done);
    });
  });
});