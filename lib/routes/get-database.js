'use strict';

const express = require('express'), 
  router = express.Router(), 
  app = require('../../app'), 
  utils = require('../utils'), 
  auth = require('../auth');

router.get('/:db', auth.isAuthenticated, (req, res) => {
  app.db.get('').pipe(res);
});

module.exports = router;
