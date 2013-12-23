var debug = require('debug')('cruise:state');
var Follower = require('./follower');

/**
 * Add the shared rpc methods to our state
 */

module.exports = function (State) {
  return State
    .rpc('heartbeat', heartbeat)
    .rpc('appendEntries', appendEntries)
    .rpc('onVoteRequest', onVoteRequest);
};


/**
 * Heartbeat function
 */

function heartbeat (req, callback) {
  this.debug('received heartbeat');
  this.node.heartbeat(Date.now());
  callback();
}


/**
 * The RPC handler for the `appendEntries`
 */

function appendEntries (req, callback) {
  var node = this.node;
  var term = node.term();
  var log = node.log();
  var failure = {
    term: term,
    success: false
  };

  if (req.term < term) {
    this.debug('received outdated term expected %s, got %s ', term, req.term);
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


/**
 * RPC handler to respond to a vote request.
 */

function onVoteRequest (req, callback) {
  var node = this.node;
  var term = node.term();
  var rejected  = { term: term, voteGranted: false };
  var granted = { term: req.term, voteGranted: true };

  this.debug('received vote request %j', req);

  if (req.term < term) return callback(null, rejected);
  if (req.term > term) {
    node.term(req.term);
    callback(null, granted);
    return this.emit('change', 'follower');
  }

  var votedFor = node.votedFor();
  if (votedFor && votedFor !== req.candidate) return callback(null, rejected);

  node.votedFor(req.candidate);
  return callback(null, granted);
}
