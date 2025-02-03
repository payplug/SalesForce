'use strict';

const Site = require('dw/system/Site');
const Locale = require('dw/util/Locale');
const URLUtils = require('dw/web/URLUtils');
const Calendar = require('dw/util/Calendar');
const BasketMgr = require('dw/order/BasketMgr');

/** Scripts Declaration */
const PayPlugUtils = require('~/cartridge/scripts/util/PayPlugUtils');
const PayPlugServiceConfig = require('*/cartridge/services/PayPlugServiceConfig');


function PayPlugRetrieveRequest(paymentID) {
	this.body = {};
	this.paymentID = paymentID;
}


PayPlugRetrieveRequest.prototype.getRequest = function getRequest() {
	return {
		endpoint: PayPlugServiceConfig.getRetrieveEndpoint(this.paymentID),
		body: this.body
	};
}

module.exports = PayPlugRetrieveRequest;
