"use strict";

require('./config/config.js');
const bodyParser = require('body-parser');
const {mongoose}  = require('./db/mongoose');
const _ = require('lodash');
const app = require('express')();

app.use(bodyParser.json());
app.use(require('./routes/user/user'));
app.use(require('./routes/user/user-phone'));
app.use(require('./routes/user/user-address'));

app.listen(process.env.PORT, () => {
    console.log(`Started on port ${process.env.PORT}`);
});

module.exports = {app};