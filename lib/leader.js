var State = require('cruise-state');
var shared = require('./shared');

var Leader = module.exports = State('Leader')
  .interval(heartbeat, 100);


/**
 * Add our shared RPCs to the `Leader` state
 */

shared(Leader);


function heartbeat () {
  this.debug('sending hearbeat message');
  var node = this.node;
  var peers = node.peers();
  peers.forEach(function (peer) {
    peer.call('heartbeat', {}, function () {});
  });
}