"use strict";

const moment = require('moment');

const genPayload = ({_id, access, expTime}) => {
  const payload = {
      access: access, 
      _id: _id.toHexString(),
      iat: moment.now(),
      exp: expTime ? expTime : moment().add(1,'day').valueOf()
  };

  return payload;
};

module.exports = {
  genPayload
};