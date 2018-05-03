"use strict";

const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');
const _ = require('lodash');

const {User} = require('./../../db/models/user.js');
const {app} = require('./../../server.js');
const {populateUsers, users, personalData} = require('./seed/user_seed.js');

beforeEach(populateUsers);
describe('Server.js /users/** routes ',() => {  
    describe('POST /users/register', ()=>{
        it('should create a user', (done)=>{
            const tempUser = {
                email: "tempUser@test.com",
                password: 'tempUserPassword'
            };
    
            request(app)
                .post('/users/register')
                .send(tempUser)
                .expect(201)
                .expect((res)=>{
                    expect(res.body._id).toBeTruthy();
                    expect(res.body.email).toEqual(tempUser.email);
                })
                .end(async (err) => {
                    if(err){
                        return done(err);
                    };
    
                    try {
                        const user = await User.findOne({email: tempUser.email});
                        expect(user).toBeTruthy();
                        expect(user.password).toBeTruthy();
                        done();
                    } catch (e) {
                        done(e);
                    };
                });
        });
    
        it("should return validation errors if request invalid", (done) => {
            const tempUser = {
                something: false
            };
    
            request(app)
                .post('/users/register')
                .send(tempUser)
                .expect(400)
                .end(done);
        });
    
        it("should not create if email in use", (done) => {
            const tempUser = {
                email: users[0].email,
                password: '123abc'
            };
    
            request(app)
                .post('/users/register')
                .send(tempUser)
                .expect(409)
                .end(done);
        });
    });
    
    describe('POST /users/login', () => {
        it('should login user and return auth token', (done)=> {
            
            request(app)
                .post('/users/login')
                .send({...users[2]})
                .expect(200)
                .expect((res)=>{
                    expect(res.body.email).toBe(users[2].email);
                    expect(res.body._id).toBe(users[2]._id.toHexString());
                    expect(res.headers['x-auth']).toBeTruthy();
                })
                .end(async (err,res)=>{
                    if(err){
                       return done(err);
                    };
    
                    try{ 
                        const user = await User.findById(users[2]._id);
                        expect(user.tokens[1]).toMatchObject({
                            access: 'auth',
                            token: res.headers['x-auth']
                        });
                        done();
                    }catch(e){
                        done(e);
                    };
                });
        });
    
        it('should reject login with bad credentials' , (done) => {
            request(app)
                .post('/users/login')
                .send({
                    email: 'inexistentEmail@gmail.com',
                    password: 'password'
                })
                .expect(404)    
                .end(done);
        });
    
        it('should reject login if empty or wrong data' , (done) => {
            request(app)
                .post('/users/login')
                .send({
                    kelok: 'fa;sdlcom',
                    NOTpassword: 'password'
                })  
                .expect(400)
                .end(done);
        });
    });
    
    describe('GET /users/me', ()=>{
        it('should return user if authenticated', (done) => {
            request(app)
                .get('/users/me')
                .set('x-auth', users[2].tokens[0].token)
                .expect(200)
                .expect((res)=>{
                    expect(users[2].email).toBe(res.body.email);
                    expect(users[2]._id.toHexString()).toBe(res.body._id);
                })
                .end(done);
        });

        it('should return 401 if not authenticated', (done) => {
            request(app)
                .get('/users/me')
                .expect(401)
                .expect((res)=>{
                    expect(res.body).toEqual({});
                })
                .end(done);
        });
    });

    describe('DELETE /users/me/token', ()=>{
        it('should remove auth token on logout if authenticated',(done)=>{
            request(app)
            .delete('/users/me/token')
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .end(async (err, res) => {
                if(err){
                    return done(err);
                };

                try{
                    const user = await User.findById(users[0]._id);
                    expect(user.tokens.length).toBe(0);
                    done();
                } catch (e) {
                    done(e);
                };
            });
        });

        it('should return 401 if unauthorized', (done)=>{
            request(app)
                .delete('/users/me/token')
                .set('x-auth', users[0].tokens.token + 'salt')
                .expect(401)
                .end(done);
        });
    });

    describe('POST /users/personal/set',()=>{
        it('should populate personal data from a created user', (done) => {
            request(app)
                .post('/users/personal/set')
                .set('x-auth', users[2].tokens[0].token)
                .send({...personalData[0]})
                .expect(200)
                .expect((res)=>{
                    expect(res.body._id ).toBe(users[2]._id.toHexString())
                })
                .end(async (err, res) => {
                    if(err){
                        return done(err);
                    };
                    
                    try {
                        const user = await User.findById(res.body._id);
                        expect(user.personal).toMatchObject(personalData[0])
                        done();
                    } catch (e) {
                        done(e);
                    }
                });
        });

        it('should populate only name and secondname from a created user', (done) => {
            let tempData = _.pick(personalData[0], ['name', 'secondName']);
            
            request(app)
            .post('/users/personal/set')
            .set('x-auth', users[2].tokens[0].token)
            .send({...tempData})
            .expect(200)
            .expect((res)=>{
                expect(res.body._id ).toBe(users[2]._id.toHexString())
            })
            .end(async (err, res) => {
                if(err){
                    return done(err);
                };
                
                try {
                    const user = await User.findById(res.body._id);
                    expect(user.personal).toMatchObject(tempData);

                    done();
                } catch (e) {
                    done(e);
                }
            });
        });

        it('should populate only personal.address data from a created user', (done) => {

            let tempData = _.pick(personalData[0], ['address']);
            request(app)
                .post('/users/personal/set')
                .set('x-auth', users[2].tokens[0].token)
                .send({...personalData[0]})
                .expect(200)
                .expect((res)=>{
                    expect(res.body._id ).toBe(users[2]._id.toHexString())
                })
                .end(async (err, res) => {
                    if(err){
                        return done(err);
                    };
                    
                    try {
                        const user = await User.findById(res.body._id);
                        expect(user.personal.address).toMatchObject({
                            ...personalData[0].address
                        });

                        done();
                    } catch (e) {
                        done(e);
                    }
                });
        });

        it('should update if data exists', (done) => {
            let tempUser = {
                name: 'Random',
                phone:{code: 'en-US'},
                address:{country: "USA"}
            };
            request(app)
                .post('/users/personal/set')
                .set('x-auth', users[0].tokens[0].token)
                .send({
                    name: tempUser.name,
                    phone: {
                        code: tempUser.phone.code
                    },
                    address: {
                        country: tempUser.address.country
                    }
                })
                .expect(200)
                .expect(res=>{
                    expect(res.body._id).toBe(users[0]._id.toHexString());
                })
                .end(async(err, res)=>{
                    if(err){
                        return done(err);
                    }
                    try{
                        const user = await User.findById(res.body._id);
                        expect(user.personal).toMatchObject(tempUser);
                        done();
                    } catch(e){
                        done(e);
                    }
                })
        });

        it('should return 401 if unauthorized' ,(done) => {
            request(app)
                .post('/users/personal/set')
                .set('x-auth', users[0].tokens[0].token + 'salt')
                .expect(401)
                .end(done);
        });

        it('should return 400 if inexistent data',(done)=>{
            request(app)
            .post('/users/personal/set')
            .set('x-auth', users[0].tokens[0].token)
            .expect(400)
            .end(done);
        });

        it('should return 400 if wrong data',(done)=>{
            request(app)
            .post('/users/personal/set')
            .set('x-auth', users[0].tokens[0].token)
            .send({
                something: true,
                usuario: 'user'
            })
            .expect(400)
            .end(done);
        });
    });
});
