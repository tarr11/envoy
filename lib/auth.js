var express = require('express'),
  path = require('path'),
  app = require('../app'),
  router = express.Router(),
  plugin = process.env.ENVOY_AUTH || 'default',
  internalPlugins = {
    couchdb_user: __dirname + '/plugins/auth/couchdb_user.js',
    default: __dirname + '/plugins/auth/default.js'
  },
  isCustom = !internalPlugins[plugin],
  pluginPath = isCustom ? plugin : internalPlugins[plugin];

console.log('[OK]  Using the ' + isCustom ? pluginPath : plugin + ' auth plugin');
module.exports = require(path.resolve(pluginPath))(app, router);