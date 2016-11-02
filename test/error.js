'use strict';
/* globals testUtils */

var assert = require('assert'),
  app = require('../app'),
  request = require('request'),
  remoteURL = null;

describe('error', function () {
  
  before(function() {
    return testUtils.createUser().then(function(url){
      remoteURL = url.replace(/\/[a-z0-9]+$/, '');
    });
  });
  
  it('visit unknown url to force a 400 error', function (done) {
    var r = { 
      url: remoteURL + '/_missing', 
      method: 'get',
      json: true
    };
    request(r, function (err, r, response) {
      assert.equal(r.statusCode, 400);
      done();
    });
  });
  
});
