var State = require('cruise-state');

/**
 * Module `exports`
 */

var Candidate = module.exports = State('candidate');

/**
 * Initialize our Candidate
 */

Candidate.prototype.init = function () {
  this.requestVotes();
};


/**
 * Request a new election
 */

Candidate.prototype.requestVotes = function () {
  var node = this.node;
  var peers = node.peers();

  node.term(node.term() + 1);

  this.debug('%s/%s: requesting votes...', node.id(), node.term());

  var log = node.log();
  var last = log.last();
  var req = {
    term : node.term(),
    candidate : node.id(),
    lastLogIndex : last.index,
    lastLogTerm : last.term
  };

  var self = this;
  var votes = 0;
  peers.forEach(function (peer) {
    peer.call('onVoteRequest', req, function (err, res) {
      self.debug('received response', err, res);
      if (err) return debug(err);
      if (self.elected) return;
      if (res.voteGranted) votes++;
      if (votes > Math.floor(peers.length / 2)) self.elected = true;
      if (self.elected) self.emit('change', 'leader');
    });
  });
};


