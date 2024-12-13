'use strict';

const Site = require('dw/system/Site');
const Locale = require('dw/util/Locale');
const URLUtils = require('dw/web/URLUtils');
const Calendar = require('dw/util/Calendar');
const BasketMgr = require('dw/order/BasketMgr');

/** Scripts Declaration */
const PayPlugUtils = require('~/cartridge/scripts/util/PayPlugUtils');
const PayPlugServiceConfig = require('*/cartridge/services/PayPlugServiceConfig');
const PaymentMethodHelper = require('~/cartridge/scripts/helpers/OneyPaymentMethodHelper');


function PayPlugOneySimulationRequest(amount) {
	this.body = {
		amount: amount,
		country: Locale.getLocale(request.getLocale()).getCountry(),
		operations: PaymentMethodHelper.getOneyApplicablePaymentMethods(customer, amount)
	};
}


PayPlugOneySimulationRequest.prototype.getRequest = function getRequest() {
	return {
		endpoint: PayPlugServiceConfig.getOneySimulation(),
		body: this.body
	};
}

module.exports = PayPlugOneySimulationRequest;
