'use strict';

const {Personal} = require('./../../../db/models/personal');

const personals = [];

const populatePersonal = async () => {
  try {
    await Personal.remove({});
  } catch (err) {
    throw new Error(err);
  };
};

module.exports = {
  personals,
  populatePersonal
};