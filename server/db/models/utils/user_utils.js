"use strict";

const moment = require('moment');

const genPayload = ({_id, access, expTime}) => {
  const payload = {
      access: access, 
      _id: _id.toHexString(),
      iat: moment.now() / 1000,
      exp: expTime ? expTime : Math.floor(moment.now() / 1000) + ((moment().add(1, 'h') - moment.now()) / 1000)
  };

  return payload;
};

module.exports = {
  genPayload
};