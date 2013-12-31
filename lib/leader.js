var State = require('cruise-state');

/**
 * Export the `Leader` constructor
 */

var Leader = module.exports = State('Leader')
  .interval(heartbeat, 100);


/**
 * Initialize the leader state
 */

Leader.prototype.init = function () {
  this._matchIndexes = {};
  this._nextIndexes = {};
};


Leader.prototype.record = function (value, callback) {
  this.debug('recording log entry: %j', value);
  var node = this.node;
  var log = node.log();
  var last = log.last();

  var req = {
    entries: [value],
    term: this.node.term(),
    leader: this.node.id(),
    prevLogIndex: last.index,
    prevLogTerm: last.term,
    leaderCommit: log.commitIndex()
  };

  var self = this;
  this.send('appendEntries', req, function (err, success) {
    if (err) return self.debug('an error occured %s', err);
    if (!success) return self.debug('failed to add: %j', value);
    self.debug('added: %j', value);
  });
};


/**
 * Sends a heartbeat to each of the leader's peers
 */

function heartbeat () {
  var node = this.node;
  var peers = node.peers();
  peers.forEach(function (peer) {
    peer.call('heartbeat', {}, function () {});
  });
}