var debug = require('debug')('cruise:state:candidate');
var Emitter = require('events').EventEmitter;
var inherits = require('util').inherits;


function Candidate (node) {
  this.node = node;
  this.requestVotes();
}


inherits(Candidate, Emitter);


Candidate.prototype.requestVotes = function () {
  var node = this.node;
  var peers = node.peers();

  node.term(node.term() + 1);

  debug('%s/%s: requesting votes...', node.id(), node.term());

  var req = {
    term : node.term(),
    candidate : node.id(),
    lastLogIndex : node.lastLogIndex(),
    lastLogTerm : node.lastLogTerm()
  };

  peers.forEach(function (peer) {
    peer.call('onVoteRequest', req, function (err, res) {

    });
  });
};


Candidate.prototype.appendEntries = function () {

};


Candidate.prototype.onVoteRequest = function (req, callback) {
  var node = this.node
    , term = node.term()
    , res  = { term : term, voteGranted : false };

  debug('%s/%s: received vote request', node.id(), term);

  if (req.term < term) return callback(null, res);
  if (req.term > term) {
    node.term(req.term);
    this.emit('change', 'follower');
  }

  var votedFor = node.votedFor();
  if (votedFor && votedFor !== req.candidate) return callback(null, res);

  node.votedFor(req.candidate);
  return callback(null, { term : term, voteGranted : true });
};