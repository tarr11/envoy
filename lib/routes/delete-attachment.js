'use strict';

var express = require('express'),
  router = express.Router(),
  app = require('../../app'),
  access = require('../access'),
  auth = require('../auth');

router.delete('/' + app.dbName + '/:id/*', auth.isAuthenticated, function(req, res) {
  var id = access.addOwnerId(req.params.id, req.session.user.name);
  app.db.attachment.destroy(id, req.params['0'], req.query, function(err, body) {
    if (err) {
      return utils.sendError(err, res);
    } 
    res.send(access.strip(body));
  });
});

module.exports = router;