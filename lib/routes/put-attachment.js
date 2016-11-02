'use strict';

var express = require('express'),
  router = express.Router(),
  app = require('../../app'),
  access = require('../access'),
  rawParser = require('body-parser').raw({type:'*/*'}),
  auth = require('../auth');

router.put('/' + app.dbName + '/:id/*', auth.isAuthenticated, rawParser, function(req, res) {
  var id = access.addOwnerId(req.params.id, req.session.user.name);
  app.db.attachment.insert(id, req.params['0'], req.body, req.headers['content-type'], req.query, function(err, body) {
    if (err) {
      return utils.sendError(err, res);
    } 
    res.send(access.strip(body));
  });
});

module.exports = router;