'use strict';

const Site = require('dw/system/Site');
const Locale = require('dw/util/Locale');
const URLUtils = require('dw/web/URLUtils');
const Calendar = require('dw/util/Calendar');
const BasketMgr = require('dw/order/BasketMgr');

/** Scripts Declaration */
const PayPlugUtils = require('~/cartridge/scripts/util/PayPlugUtils');
const PayPlugServiceConfig = require('*/cartridge/services/PayPlugServiceConfig');


function PayPlugRemoveCustomerCardRequest(cardID) {
	this.body = {};
	this.cardID = cardID;
}


PayPlugRemoveCustomerCardRequest.prototype.getRequest = function getRequest() {
	return {
		endpoint: PayPlugServiceConfig.getRemoveCardEndpoint(this.cardID),
		body: this.body
	};
}

module.exports = PayPlugRemoveCustomerCardRequest;
