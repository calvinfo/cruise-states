var debug = require('debug')('cruise:state:follower');
var Emitter = require('events').EventEmitter;
var jit = require('jit');


module.exports = Follower;


function Follower (node) {
  this.node = node;
  this.timeout = 300;
  this.checkPulse();
}



Follower.prototype = new Emitter();


Follower.prototype.checkPulse = function () {
  var heartbeat = this.node.heartbeat();
  var stale = Date.now() - this.timeout > heartbeat;

  if (!stale) return jit(this.checkPulse.bind(this), this.timeout);

  debug('changing state to candidate');
  this.emit('change', 'candidate');
};


