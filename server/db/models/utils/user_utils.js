"use strict";

const moment =require('moment');

const genPayload = ({_id, access, expTime}) => {
  console.log(access + _id.toHexString())
  const payload = {
      access: access, 
      _id: _id.toHexString(),
      iat: moment.now(),
      exp: expTime ? expTime : moment().add(1,'day').valueOf()
  }
  console.log(access+2)
  return payload;
}

module.exports = {
  genPayload
}