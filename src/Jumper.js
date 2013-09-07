/**
 * @namespace
 * @requires Leapjs
 */
/**
 * Creates a new Jumper.
 * @param {Object} opt_interactionBoxOptions Initial interaction box options.
 */
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
 */
Jumper.prototype.animFrame = function(frame) {

  var jumper, hands = frame.hands;

  exports.PubSub.publish('animFrame', frame);

  if (!Burner) {
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
