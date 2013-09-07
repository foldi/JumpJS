/**
 * Creates a new StatusMessage.
 *
 * @param {Object} el A DOM element.
 * @param {Object} options A map of initial properties.
 * @constructor
 */
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

