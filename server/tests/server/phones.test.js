const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');
const {pick} = require('lodash');

const {app} = require('./../../server.js');
const {Phone, phonesData, populatePhones, users} = require('./seed/phone_seed');

beforeEach(populatePhones);

describe('Serverjs /users/me/phone** routes', () => {
  describe('POST /users/me/phone', () => {
    it('should save a new phone', (done) => {
      const tempPhone = {
        _creator: users[1]._id.toHexString(),
        code: "es-AR",
        number: "605842890"
      };
  
      request(app)
        .post('/users/me/phone')
        .set('x-auth', users[0].tokens[0].token)
        .send({...tempPhone})
        .expect(200)
        .expect((res)=>{
          expect(res.body.user).toMatchObject({_id: users[0]._id.toHexString(), email: users[0].email});
          expect(res.body.phone).toBeTruthy();
        })
        .end(async(err, res) => {
          if(err){
            return done(err);
          };
  
          try{ 
            const phone = await Phone.findById(res.body.phone._id);
            expect(phone).toMatchObject({...tempPhone});
            done();
          } catch (err) {
            done(err)
          };
        });
    });

    it('should return 400 if wrong data or inexistent', (done) => {
      request(app)
        .post('/users/me/phone')
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
        .post('/users/me/phone')
        .expect(401)
        .end(done);
    });
  });

  
  describe('DELETE /users/me/phone/:id', () => {
    it('should remove a phone if authenticated and phone exists', (done) => {
      request(app)
        .delete(`/users/me/phone/${phonesData[0]._id}`)
        .set('x-auth', users[0].tokens[0].token)
        .expect(200)
        .end(done);
    });

    it('should return 404 if not found', (done) => {
      request(app)
        .delete(`/users/me/phone/${phonesData[2]._id}`)
        .set('x-auth', users[0].tokens[0].token)
        .expect(200)
        .end(done);
    });

    it('should return 400 if id is invalid', (done) => {
      request(app)
        .delete(`/users/me/phone/${phonesData[2]._id+1}`)
        .set('x-auth', users[0].tokens[0].token)
        .expect(400)
        .end(done);
    });

    it('should return 401 if unauthorized',(done)=>{
      request(app)
        .delete(`/users/me/phone/${phonesData[0]._id}`)
        .expect(401)
        .end(done);
    });
  });

  describe('PATCH /users/me/phone/:id', () => {
    it('should patch phone by id', (done)=>{
      let tempPhone = {
        code: 'ex-EX',
        number: '699999899',
        main_phone: true 
      }

      request(app)
      .patch(`/users/me/phone/${phonesData[0]._id}`)
      .set('x-auth', users[0].tokens[0].token)
      .send({
        ...tempPhone
      })
      .expect(200)
      .expect((res)=>{
        expect(tempPhone).toMatchObject(pick(res.body, ['code', 'number', 'main_phone']));
        tempPhone = res.body;
      })
      .end(async(err,res)=>{
        if(err){
          return done(err);
        };

        try{
          const phone = await Phone.findById(res.body._id);
          expect({
            ...phone.toObject(),
            _id: phone._id.toHexString()
          }).toMatchObject({...tempPhone})
          done();
        }catch(e){
          done(e);
        };
      });
    });
    
    it('should return 401 if unauthorized',(done)=>{
      request(app)
        .patch(`/users/me/phone/${phonesData[0]._id}`)
        .expect(401)
        .end(done);
    });

    it('should return 400 if id is invalid', (done) => {
      request(app)
        .patch(`/users/me/phone/${phonesData[2]._id+1}`)
        .set('x-auth', users[0].tokens[0].token)
        .expect(400)
        .end(done);
    });

    it('should return 404 if not found', (done) => {
      request(app)
        .patch(`/users/me/phone/${phonesData[2]._id}`)
        .set('x-auth', users[0].tokens[0].token)
        .expect(200)
        .end(done);
    });
  });

  describe('GET /users/me/phone/:id', () => {
    it('should return phone data by ID', (done) => {
      request(app)
        .get(`/users/me/phone/${phonesData[0]._id}`)
        .set('x-auth', users[0].tokens[0].token)
        .expect(200)
        .end((err, res)=>{
          if(err){
            return done(err);
          }
          expect(res.body).toMatchObject(phonesData[0])
          done();
      });
    });

    it('should return 400 if wrong data', (done) => {
      request(app)
        .get(`/users/me/phone/${phonesData[0]._id}Salt`)
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
      .get(`/users/me/phone/${new ObjectID().toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
    });

    it('should return 401 if unauthorized',(done)=>{
      request(app)
        .get('/users/me/phone/:id')
        .expect(401)
        .end(done);
    });
  });

  describe('GET /users/me/phone/', () => {
    it('should return a array of phones by creator _id', (done) => {
      request(app)
        .get('/users/me/phone')
        .set('x-auth', users[0].tokens[0].token)
        .expect(200)
        .expect(res=>{
          expect(res.body[0]).toMatchObject(phonesData[0]);
          expect(res.body.length).toBe(1);
        })
        .end(done);
    });

    it('should return 404 if no phones found', (done) => {
      request(app)
        .get('/users/me/phone')
        .set('x-auth', users[2].tokens[0].token)
        .expect(404)
        .end(done)
    });

    it('should return 401 if unauthorized',(done)=>{
      request(app)
        .get('/users/me/phone')
        .expect(401)
        .end(done);
    });
  });
});