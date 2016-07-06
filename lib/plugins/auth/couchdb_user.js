'use strict';
const basicAuth = require('basic-auth');
const USERS_DATABASE_NAME = '_users';
const app = require('../../../app');
const express = require('express');
const router = express.Router();
let usersdb = null;

// create _users database if it doesn't exist already
// called at startup
const init =  callback => {
  usersdb = app.cloudant.db.use(USERS_DATABASE_NAME);
  app.cloudant.db.create('_users', (err, body, header) => {
    // 201 response == created
    // 412 response == already exists
    if ((err && err.statusCode !== 412) || 
         (!err &&  header.statusCode !== 201)) {
      return callback(err, '[ERR] createUsersDB: please log into your CouchDB Dashboard and create a new database called _users.')
    }
    callback(null, '[OK]  Created _users database');
  });
};

// create a new user - this function is used by the 
// test suite to generate a new user
const newUser = (username, password, callback) => {
  const user = {
    _id: 'org.couchdb.user:' + username,
    type: 'user',
    name: username,
    roles: [],
    username: username,
    password_scheme: 'simple',
    password: password
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
  app.cloudant.auth(user.name, user.pass, (err, data) => {
    if (!err && data) {
      req.session.user = data;
      return next();
    } else {
      return unauthorized(res);
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
  unauthorized: unauthorized
};
