var express = require('express'),
  path = require('path'),
  app = require('../app'),
  router = express.Router(),
  plugin = process.env.ENVOY_ACCESS || 'default',
  internalPlugins = {
    default: __dirname + '/plugins/access/default.js',
    id: __dirname + '/plugins/access/id.js',
    meta: __dirname + '/plugins/access/meta.js'
  },
  isCustom = !internalPlugins[plugin],
  pluginPath = isCustom ? plugin : internalPlugins[plugin];


console.log('[OK]  Using the ' + isCustom ? pluginPath : plugin + ' access control plugin');
module.exports = require(path.resolve(pluginPath))(app, router);
