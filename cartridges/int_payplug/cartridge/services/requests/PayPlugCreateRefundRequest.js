'use strict';

const Site = require('dw/system/Site');
const Locale = require('dw/util/Locale');
const URLUtils = require('dw/web/URLUtils');
const Calendar = require('dw/util/Calendar');
const BasketMgr = require('dw/order/BasketMgr');

/** Scripts Declaration */
const PayPlugUtils = require('~/cartridge/scripts/util/PayPlugUtils');
const PayPlugServiceConfig = require('*/cartridge/services/PayPlugServiceConfig');


function PayPlugCreateRefundRequest(amount, order) {
	this.body = {
		amount: amount,
		metadata: {
			customer_id: order.getCustomerNo(),
			transaction_id: order.getOrderNo()
		}
	};
	this.paymentReference = order.getCustom()['pp_pspReference'];
}


PayPlugCreateRefundRequest.prototype.getRequest = function getRequest() {
	return {
		endpoint: PayPlugServiceConfig.getCreateRefundEndpoint(this.paymentReference),
		body: this.body
	};
}

module.exports = PayPlugCreateRefundRequest;
