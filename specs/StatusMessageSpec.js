'use strict';

describe("StatusMessage", function() {

  var statusMessage;

  beforeEach(function() {
  	var container = document.createElement('div');
  	container.id = 'statusMessage';
  	document.body.appendChild(container);
    statusMessage = new StatusMessage(container);
  });

  afterEach(function() {
  	var container = document.getElementById('statusMessage');
  	document.body.removeChild(container);
  });

  it("should have its required properties.", function() {
    expect(typeof statusMessage.el).toEqual('object');
  });

});
