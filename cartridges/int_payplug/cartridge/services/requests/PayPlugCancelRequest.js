'use strict';

/** Scripts Declaration */
const PayPlugUtils = require('~/cartridge/scripts/util/PayPlugUtils');
const PayPlugServiceConfig = require('*/cartridge/services/PayPlugServiceConfig');


function PayPlugCancelRequest(paymentID) {
	this.body = {
		aborted: true
	};
	this.paymentReference = paymentID;
}


PayPlugCancelRequest.prototype.getRequest = function getRequest() {
	return {
		endpoint: PayPlugServiceConfig.getUpdateEndpoint(this.paymentReference),
		body: this.body
	};
}

module.exports = PayPlugCancelRequest;
