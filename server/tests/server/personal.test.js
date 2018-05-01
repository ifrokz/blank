'use strict';

const expect = require('expect');
const request = require('supertest');

const {Personal}  =require('./../../db/models/personal');
const {app} = require('./../../server.js');
const {populatePersonal, personals} = require('./seed/personal_seed');

beforeEach(populatePersonal);