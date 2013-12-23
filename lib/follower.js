var debug = require('debug')('cruise:state:follower');
var Emitter = require('events').EventEmitter;
var jit = require('jit');
var Candidate = require('./candidate');
var State = require('cruise-state');
var shared = require('./shared');


var Follower = module.exports = State('Follower')
  .jitter(checkPulse, 300);

/**
 * Add our shared Rpcs to the `Follower` state
 */

shared(Follower);


/**
 * Sets the timeout
 */

Follower.prototype.timeout = 300;


/**
 * Check whether this node should become a leader. If the current leader is
 * still alive, reschedule this command to be run again.
 */

function checkPulse () {
  this.debug('checking current pulse');
  var heartbeat = this.node.heartbeat();
  var stale = Date.now() - this.timeout > heartbeat;
  if (stale) this.emit('change', 'candidate');
}