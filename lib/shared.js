var debug = require('debug')('cruise:state');

function appendEntries (req, callback) {
  var node = this.node;
  var term = node.term();
  var log = node.log();
  var failure = {
    term: term,
    success: false
  };

  if (req.term < term) {
    debug('received outdated term expected %s, got %s ', term, req.term);
    return callback(null, failure);
  }

  node.term(req.term);
  node.leader(req.leader);

  var prev = log.get(req.prevLogIndex);
  if (!prev) {
    debug('could not find a log entry for %s', req.prevLogIndex);
    return callback(null, failure);
  }
}
