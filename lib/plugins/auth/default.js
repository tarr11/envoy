'use strict';
const basicAuth = require('basic-auth');
const crypto = require('crypto');
const uuid = require('uuid');
const USERS_DATABASE_NAME = 'envoyusers';
const app = require('../../../app');
const express = require('express');
const router = express.Router();
let usersdb = null;

// create envoyusers database if it doesn't exist already
// called at startup
const init = callback => {
  usersdb = app.cloudant.db.use(USERS_DATABASE_NAME);
  app.cloudant.db.create(USERS_DATABASE_NAME, (err, body, header) => {
    // 201 response == created
    // 412 response == already exists
    if ((err && err.statusCode !== 412) || 
         (!err &&  header.statusCode !== 201)) {
      return callback(err, '[ERR] createUsersDB: please log into your CouchDB Dashboard and create a new database called _users.')
    }
    callback(null, '[OK]  Created users database ' + USERS_DATABASE_NAME);
  });
};

// returns the sha1 of a string
const sha1 = string => crypto.createHash('sha1').update(string).digest('hex');

// create a new user - this function is used by the 
// test suite to generate a new user. Our envoyusers database
// follows a similar pattern to the CouchDB _users database
// but we perform the salt/hash process here
const newUser = (username, password, callback) => {
  const salt = uuid.v4();
  const user = {
    _id: username,
    type: 'user',
    name: username,
    roles: [],
    username: username,
    password_scheme: 'simple',
    salt: salt,
    password: sha1(salt + password)
  };
  return usersdb.insert(user, callback);
};

// Express middleware that is the gatekeeper for whether a request is
// allowed to proceed or not. It checks with Cloudant to see if the 
// supplied Basic Auth credentials are correct and issues a session cookie
// if they are. The next request (with a valid cookie), doesn't need to
// hit the users database
const isAuthenticated = (req, res, next) => {
  // if the user has valid session then we're good to go
  // without hitting the _users database again
  if (req.session.user) {
    return next();
  }
  
  // extract basic auth
  const user = basicAuth(req);
  if (!user || !user.name || !user.pass) {
    return unauthorized(res);
  }
  
  // validate user and save to session
  usersdb.get(user.name, (err, data) => {
    if (!data || data.password !== sha1(data.salt + user.pass)) {
      return unauthorized(res);
    } else {
      req.session.user = data;
      return next();
    }
  });
};

// the response to requests which are not authorised
var unauthorized = res => res.status(403).end();

// allow clients to see if they are logged in or not
router.get('/_auth', isAuthenticated, (req, res) => {
  res.send({ 
    loggedin: req.session.user?true:false,
    username: req.session.user?req.session.user.name:null
  });
});

// and to log out
router.get('/_logout', (req, res) => {
  delete req.session.user;
  res.send({ok: true});
});

module.exports = {
  init: init,
  newUser: newUser,
  isAuthenticated: isAuthenticated,
  unauthorized: unauthorized,
  routes: router
};
