"use strict";

const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');
const _ = require('lodash');

const {User} = require('./../../db/models/user.js');
const {app} = require('./../../server.js');
const {populateUsers, users, personalData} = require('./seed/user_seed.js');

beforeEach(populateUsers);

describe('Server.js /api/users/** routes ',() => {  
    describe('POST /api/users/register', ()=>{
        it('should create a user', (done)=>{
            const tempUser = {
                email: "tempUser@test.com",
                password: 'tempUserPassword'
            };
    
            request(app)
                .post('/api/users/register')
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
                .post('/api/users/register')
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
                .post('/api/users/register')
                .send(tempUser)
                .expect(409)
                .end(done);
        });
    });
    
    describe('POST /api/users/login', () => {
        it('should login user and return auth token', (done)=> {
            
            request(app)
                .post('/api/users/login')
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
                .post('/api/users/login')
                .send({
                    email: 'inexistentEmail@gmail.com',
                    password: 'password'
                })
                .expect(404)    
                .end(done);
        });
    
        it('should reject login if empty or wrong data' , (done) => {
            request(app)
                .post('/api/users/login')
                .send({
                    kelok: 'fa;sdlcom',
                    NOTpassword: 'password'
                })  
                .expect(400)
                .end(done);
        });
    });
    
    describe('GET /api/users/me', ()=>{
        it('should return user if authenticated', (done) => {
            request(app)
                .get('/api/users/me')
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
                .get('/api/users/me')
                .expect(401)
                .expect((res)=>{
                    expect(res.body).toEqual({});
                })
                .end(done);
        });
    });

    describe('DELETE /api/users/me/token', ()=>{
        it('should remove auth token on logout if authenticated',(done)=>{
            request(app)
            .delete('/api/users/me/token')
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
                .delete('/api/users/me/token')
                .set('x-auth', users[0].tokens.token + 'salt')
                .expect(401)
                .end(done);
        });
    });

    describe('POST /api/users/personal',()=>{
        it('should populate personal data from a created user', (done) => {
            request(app)
                .post('/api/users/personal')
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

        it('should populate only name and second name from a created user', (done) => {
            let tempData = _.pick(personalData[0], ['name', 'second_name']);
            
            request(app)
            .post('/api/users/personal')
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

        it('should return 401 if unauthorized' ,(done) => {
            request(app)
                .post('/api/users/personal')
                .set('x-auth', users[0].tokens[0].token + 'salt')
                .expect(401)
                .end(done);
        });

        it('should return 400 if inexistent data',(done)=>{
            request(app)
            .post('/api/users/personal')
            .set('x-auth', users[0].tokens[0].token)
            .expect(400)
            .end(done);
        });

        it('should return 400 if wrong data',(done)=>{
            request(app)
            .post('/api/users/personal')
            .set('x-auth', users[0].tokens[0].token)
            .send({
                something: true,
                usuario: 'user'
            })
            .expect(400)
            .end(done);
        });
    });








    describe('PATCH /api/users/personal',()=>{
        it('should populate personal data from a created user', (done) => {
            request(app)
                .post('/api/users/personal')
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

        it('should populate only name and second name from a created user', (done) => {
            let tempData = {
                name: 'Andrew',
                second_name: 'Moros'
            };
            
            request(app)
            .patch('/api/users/personal')
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

        it('should return 401 if unauthorized' ,(done) => {
            request(app)
                .patch('/api/users/personal')
                .set('x-auth', users[0].tokens[0].token + 'salt')
                .expect(401)
                .end(done);
        });

        it('should return 400 if inexistent data',(done)=>{
            request(app)
            .patch('/api/users/personal')
            .set('x-auth', users[0].tokens[0].token)
            .expect(400)
            .end(done);
        });

        it('should return 400 if wrong data',(done)=>{
            request(app)
            .patch('/api/users/personal')
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
