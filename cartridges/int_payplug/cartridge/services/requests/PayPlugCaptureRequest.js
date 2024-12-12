'use strict';

const Site = require('dw/system/Site');
const Locale = require('dw/util/Locale');
const URLUtils = require('dw/web/URLUtils');
const Calendar = require('dw/util/Calendar');
const BasketMgr = require('dw/order/BasketMgr');

/** Scripts Declaration */
const PayPlugUtils = require('~/cartridge/scripts/util/PayPlugUtils');
const PayPlugServiceConfig = require('*/cartridge/services/PayPlugServiceConfig');


function PayPlugCaptureRequest(order) {
	this.body = {
		captured: true
	};
	this.paymentReference = order.getCustom()['pp_pspReference'];
}


PayPlugCaptureRequest.prototype.getRequest = function getRequest() {
	return {
		endpoint: PayPlugServiceConfig.getCaptureEndpoint(this.paymentReference),
		body: this.body
	};
}

module.exports = PayPlugCaptureRequest;
