var stream = require('stream');

// adds owner id to an a document id
// e.g. dog becomes glynn-dog
var addOwnerId = function(id, ownerid) {
  var match = id.match(/_local\/(.*)/);
  if (match) {
    var localid = match[1];
    return '_local/' + ownerid + '-' + localid;
  } else {
    return ownerid + '-' + id;
  }
};

// removes ownerid from a document id
// e.g. glynn-dog becomes dog
var removeOwnerId = function(id) {
  var match = id.match(/_local\/(.*)/);
  if (match) {
    var localid = match[1].replace(/^[^-]+\-/,'');
    return '_local/' + localid;
  } else {
    return id.replace(/^[^-]+\-/,''); 
  }
};

// determines whether a document id is owned by ownerid
var myId = function(id, ownerid) {
  return (id.indexOf(ownerid + '-') === 0 ||
    id.indexOf('_local/' + ownerid +'-') ===0);
};

// determines whether a doc object is owned by ownerd
var isMine = function(doc, ownerid) {
  return (doc && doc._id && myId(doc._id, ownerid));
};

// strips a document of its ownership information
var strip = function(doc) {
  if (typeof doc === 'object' && doc._id) {
    doc._id = removeOwnerId(doc._id);    
  }
  return doc;
};

// adds 
var addAuth = function(doc, ownerid) {
  doc._id = addOwnerId(doc._id, ownerid);
  return doc;
};

// stream transformer that removes auth details from documents
var authRemover = require('./common/authremover.js')(myId, removeOwnerId);

module.exports = function() {
  return {
    addOwnerId: addOwnerId,
    removeOwnerId: removeOwnerId,
    myId: myId,
    isMine: isMine,
    strip: strip,
    addAuth: addAuth,
    authRemover: authRemover
  };
};
