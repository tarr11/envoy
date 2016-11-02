'use strict';
/* globals testUtils */

var assert = require('assert'),
  auth = require('../lib/auth'),
  PouchDB = require('pouchdb'),
  fs = require('fs'),
  app = require('../app'),
  uuid = require('uuid'),
  url1 = null,
  remoteURL = null,
  ATT_TXT = new Buffer('abc').toString('base64'),
  ATT_TXT2 = new Buffer("Hello World").toString('base64'),
  localBob = null,
  remoteBob = null;

describe('CRUD', function () {

  var dbs = { local: 'testdb', secondary: 'testdb2' };;

  it('test cleanup', function (done) {
    testUtils.cleanup([dbs.local, dbs.secondary], function () {
      localBob = new PouchDB(dbs.local);
      done();
    });
  });

  it('create user', function () {
    return testUtils.createUser(2).then(function (urls) {
      url1 = urls[0].replace(/\/[a-z0-9]+$/, '');

      remoteBob = new PouchDB(urls[0]);
    });
  });

  it('create an attachment and replicate it', function () {
    return localBob.putAttachment('mydoc', 'att.txt', ATT_TXT, 'text/plain').then(function (data) {
      assert.equal(typeof data, 'object');
      return localBob.replicate.to(remoteBob)
    }).then(function () {
      assert(true);
    }).catch(function (e) {
      // shouldn't get here'
      assert(false);
    });;
  });

  it('replicate attachment back again', function () {
    return localBob.replicate.from(remoteBob).then(function (d) {
      return localBob.get('mydoc');
    }).then(function (data) {
      assert.equal(typeof data, 'object');
      assert.equal(typeof data._attachments, 'object');
      assert.equal(typeof data._attachments['att.txt'], 'object');
      assert.equal(data._attachments['att.txt'].content_type, 'text/plain');
    }).catch(function (e) {
      // shouldn't get here'
      assert(false);
    });;
  });

  it('fetch attachment from the server', function() {
    return remoteBob.getAttachment('mydoc', 'att.txt').then(function(data) {
      var data = data.toString('utf8');
      assert.equal(data, 'abc');
    }).catch(function(e) {
      // shouldn't get here
      console.log(e.toString());
      assert(false);
    });;
  });

  it('update an attachment from the server', function() {
    return remoteBob.get('mydoc').then(function(data) {
      return remoteBob.putAttachment('mydoc', 'att.txt', data._rev, ATT_TXT2, 'text/plain');
    }).then(function(data) {
      assert.equal(typeof data, 'object');
      assert.equal(data.id, 'mydoc');
      assert.equal(typeof data.rev, 'string');
      assert.equal(data.ok, true);
    }).catch(function(e) {
      // shouldn't get here
      assert(false);
    });;
  });

  it('delete an attachment from the server', function() {
    return remoteBob.get('mydoc').then(function(data) {
      return remoteBob.removeAttachment('mydoc', 'att.txt', data._rev);
    }).then(function(data) {
      assert.equal(typeof data, 'object');
      assert.equal(data.id, 'mydoc');
      assert.equal(typeof data.rev, 'string');
      assert.equal(data.ok, true);
    }).catch(function(e) {
      // shouldn't get here
      assert(false);
    });;
  });

});
