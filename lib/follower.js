var debug = require('debug')('cruise:state:follower');
var Emitter = require('events').EventEmitter;
var jit = require('jit');
var Candidate = require('./candidate');
var State = require('cruise-state');


var Follower = module.exports = State('Follower');


Follower.prototype.timeout = 300;



Follower.on('construct', function (follower) {
  follower.checkPulse();
});


Follower.prototype.checkPulse = function () {
  var heartbeat = this.node.heartbeat();
  var stale = Date.now() - this.timeout > heartbeat;

  if (!stale) return jit(this.checkPulse.bind(this), this.timeout);
  this.emit('change', Candidate);
};


