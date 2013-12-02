var debug = require('debug')('cruise:state:candidate');
var State = require('cruise-state');
var Follower = require('./follower');
var Leader = require('./leader');


var Candidate = module.exports = State('Candidate')
  .rpc('onVoteRequest', onVoteRequest);



Candidate.on('construct', function (candidate) {
  candidate.requestVotes();
});


/**
 * Request a new election
 */

Candidate.prototype.requestVotes = function () {
  var node = this.node;
  var peers = node.peers();

  node.term(node.term() + 1);

  debug('%s/%s: requesting votes...', node.id(), node.term());

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
      debug('received response', err, res);
      if (err) return debug(err);
      if (self.elected) return;
      if (res.voteGranted) votes++;
      if (votes > Math.floor(peers.length / 2)) self.elected = true;
      if (self.elected) self.emit('change', Leader);
    });
  });
};


/**
 * RPC handler to respond to a vote request.
 */

function onVoteRequest (req, callback) {
  var node = this.node;
  var term = node.term();
  var res  = { term: term, voteGranted: false };

  debug('%s/%s: received vote request', node.id(), term);

  if (req.term < term) return callback(null, res);
  if (req.term > term) {
    node.term(req.term);
    this.emit('change', Follower);
  }

  var votedFor = node.votedFor();
  if (votedFor && votedFor !== req.candidate) return callback(null, res);

  node.votedFor(req.candidate);
  return callback(null, { term : term, voteGranted : true });
}