/*! Jump v1.0.1 - 2013-09-11 03:09:57 
 *  Vince Allen 
 *  Brooklyn, NY 
 *  vince@vinceallen.com 
 *  @vinceallenvince 
 *  License: MIT */

var Jump = {}, exports = Jump;

(function(exports) {

"use strict";

function Jumper(opt_interactionBoxOptions) {

  if (!Leap) {
    throw new Error('Jumper requires Leapjs.');
  }

  var interactionBoxOptions = opt_interactionBoxOptions || {};
  this.interactionBoxCenter = interactionBoxOptions.center || [0, 150, 0];
  this.interactionBoxSize = interactionBoxOptions.size || [300, 300, 300];
  this.handID = null;
}

/**
 * Initiliazes a Jumper. Creates interaction box and sets up event listeners.
 * @param {boolean=} opt_statusMessage False to not show a status message.
 */
Jumper.prototype.init = function(opt_createStatusMessage) {

  var createStatusMessage = typeof opt_createStatusMessage !== 'undefined' ? opt_createStatusMessage : true;

  // creates an invisibile box over the Leap controller
  this.interactionBox = new Leap.InteractionBox({
    center: this.interactionBoxCenter,
    size: this.interactionBoxSize
  });

  this.controller = new Leap.Controller({enableGestures: true});
  var controller = this.controller;
  controller.on('animationFrame', this.animFrame.bind(this));

  if (createStatusMessage) {

    var div = document.createElement('div'); // create and append status message container
    div.id = 'statusMessage';
    div.className = 'statusMessage';
    document.body.appendChild(div);

    var statusMessage = new exports.StatusMessage(document.getElementById('statusMessage'));
    statusMessage.displayMessage('Please connect a Leap motion device.', true);

    exports.PubSub.subscribe('ready', statusMessage.displayMessage.bind(statusMessage, 'ready'));
    exports.PubSub.subscribe('disconnect', statusMessage.displayMessage.bind(statusMessage, 'disconnected', true));
    exports.PubSub.subscribe('blur', statusMessage.displayMessage.bind(statusMessage, 'blur'));
    exports.PubSub.subscribe('deviceConnected',
        statusMessage.displayMessage.bind(statusMessage, 'deviceConnected'));
    exports.PubSub.subscribe('deviceDisconnected',
        statusMessage.displayMessage.bind(statusMessage, 'deviceDisconnected', true));
    exports.PubSub.subscribe('active',
        statusMessage.displayMessage.bind(statusMessage, 'active'));

    controller.on('ready', function() {
        exports.PubSub.publish('ready');
    });
    controller.on('connect', function() {
        exports.PubSub.publish('connect');
    });
    controller.on('disconnect', function() {
        exports.PubSub.publish('disconnect');
    });
    controller.on('focus', function() {
        exports.PubSub.publish('focus');
    });
    controller.on('blur', function() {
        exports.PubSub.publish('blur');
    });
    controller.on('deviceConnected', function() {
        exports.PubSub.publish('deviceConnected');
    });
    controller.on('deviceDisconnected', function() {
        exports.PubSub.publish('deviceDisconnected');
    });
  }

  controller.connect();
};

/**
 * Handles the animationFrame controller event.
 * @param {Object} frame Frame data.
 */
Jumper.prototype.animFrame = function(frame) {

  var jumper, hands = frame.hands;

  exports.PubSub.publish('animFrame', frame);

  if (typeof Burner === 'undefined') {
    return;
  }

  jumper = Burner.System.getAllItemsByAttribute('jumper')[0];

  if (!jumper) {
    return;
  }

  // If there are no hands or fingers,
  // remove target from all agents.
  if (!hands[0] || !hands[0].fingers[0]) {
    jumper.seekTarget = null;
    return;
  }

  if (this.handID !== hands[0].id) {
    exports.PubSub.publish('active');
    this.handID = hands[0].id;
  }

  var fingers = hands[0].fingers;

  // get the finger tip position
  var pt = fingers[0].stabilizedTipPosition;

  // normalize it based on the interactionBox
  var norm = this.interactionBox.normalizePoint(pt, true);

  // map the point to Flora world coords
  var width = jumper.world.width;
  var height = jumper.world.height;
  var x = Burner.System.map(norm[0], 0, 1, 0, width);
  var y = Burner.System.map(norm[1], 0, 1, height, 0);

  // create and set a target
  var target = {
    location: {
      x: x,
      y: y
    }
  };

  jumper.seekTarget = target;
};

exports.Jumper = Jumper;

var PubSub = {};

/**
 * Subscribes a callback to an event.
 * @function subscribe
 * @memberof PubSub
 * @param {string} ev An event type.
 * @param {Function} callback A function to call when the event is published.
 */
PubSub.subscribe = function (ev, callback) {
  // Create _callbacks object, unless it already exists
  var calls = this._callbacks || (this._callbacks = {});

  // Create an array for the given event key, unless it exists, then
  // append the callback to the array
  (this._callbacks[ev] || (this._callbacks[ev] = [])).push(callback);
  return this;
};

/**
 * Publishes an event. Subscribed callbacks will be invoked. Pass an event
 * name as the first argument. All other arguments will be passed to all
 * invoked callbacks.
 * @function publish
 * @memberof PubSub
 */
PubSub.publish = function () {
  // Turn arguements into a real array
  var args = Array.prototype.slice.call(arguments, 0);

  // Extract the first argument, the event name
  var ev = args.shift();

  // Return if there isn't a _callbacks object, or
  // if it doesn't contain an array for the given event
  var list, calls, i, l;
  if (!(calls = this._callbacks)) {
    return this;
  }
  if (!(list = this._callbacks[ev])) {
    return this;
  }

  // Invoke the callbacks
  for (i = 0, l = list.length; i < l; i += 1) {
    list[i].apply(this, args);
  }
  return this;
};

exports.PubSub = PubSub;

function StatusMessage(el, opt_options) {
	if (!el) {
		throw new Error('StatusMessage requires a DOM element.');
	}
  var options = opt_options || {};
  this.el = el;
  this.opacity = 1;
  this.fade = false;
  this.name = 'StatusMessage';
}

/**
 * Prints message to the body.
 * @param {string} msg The message to display.
 * @param {boolean} opt_static True to not fade message.
 */
StatusMessage.prototype.displayMessage = function(msg, opt_static) {
  this.el.innerHTML = 'Leap: <span class=\'emphasis\'>' + msg + '</span>';
  this.opacity = 1;
  this.el.style.opacity = this.opacity;
  if (!opt_static) {
    this.fade = true;
    this._update();
	}
};

/**
 * Fades status message DOM element.
 * @private
 */
StatusMessage.prototype._update = function() {
	if (this.opacity > 0) {
		this.opacity -= 0.005;
	} else {
		this.opacity = 0;
		this.fade = false;
	}
	this.el.style.opacity = this.opacity;
	if (this.fade) {
		window.requestAnimFrame(this._update.bind(this));
	}
};


exports.StatusMessage = StatusMessage;

}(exports));