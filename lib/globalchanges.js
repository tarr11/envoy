

var app = require('../app'),
  access = require('./access.js'),
  subscribers = [],
  db = app.db;

var feed = db.follow({since: 'now', include_docs: true});
feed.on('change', function (change) {
  for(var i = subscribers.length - 1; i >= 0; i--) {
    var s = subscribers[i];
    if (access.myId(change.id, s.userid )) {
      var c = JSON.parse(JSON.stringify(change));
      c.id = access.removeOwnerId(c.id);
      if (s.include_docs) {
        c.doc = access.strip(c.doc);
      } else {
        delete c.doc;
      }
      if (!s.res.write(JSON.stringify(c) + '\n')) {
        subscribers.splice(i, 1);
      }
    }
  }
});
feed.follow();

var subscribe = function(userid, res, include_docs) {
  subscribers.push({userid: userid, res: res, include_docs: include_docs});
};

module.exports = {
  subscribe: subscribe
};