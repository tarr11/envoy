'use strict';

const express = require('express'), 
  router = express.Router(), 
  auth = require('../auth'), 
  utils = require('../utils'), 
  access = require('../access'), 
  app = require('../../app');

router.get('/:db/_local/:key',  auth.isAuthenticated, (req, res) => {
  app.cloudant.request({
    db: app.dbName,
    path: access.addOwnerId('_local/' + req.params.key, req.session.user.name)
  }, (err, data) => {
    if (err) {
      return utils.sendError(err, res);
    }
    res.send(access.strip(data));
  });;
});

router.put('/:db/_local/:key',  auth.isAuthenticated, (req, res) => {
  app.cloudant.request({
    db: app.dbName,
    path: access.addOwnerId('_local/' + req.params.key, req.session.user.name),
    method: 'PUT',
    body: req.body
  }, (err, data) => {
    if (err) {
      return utils.sendError(err, res);
    }
    res.send(access.strip(data));
  });
});

module.exports = router;
