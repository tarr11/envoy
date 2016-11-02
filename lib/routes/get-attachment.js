'use strict';

var express = require('express'),
  router = express.Router(),
  app = require('../../app'),
  access = require('../access'),
  auth = require('../auth');

router.get('/' + app.dbName + '/:id/*', auth.isAuthenticated, function(req, res) {
  var id = access.addOwnerId(req.params.id, req.session.user.name);
  app.db.attachment.get(id, req.params['0']).pipe(res);
});

module.exports = router;