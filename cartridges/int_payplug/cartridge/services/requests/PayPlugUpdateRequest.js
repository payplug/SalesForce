'use strict';

const Locale = require('dw/util/Locale');
const BasketMgr = require('dw/order/BasketMgr');

/** Scripts Declaration */
const PayPlugUtils = require('~/cartridge/scripts/util/PayPlugUtils');
const PayPlugServiceConfig = require('*/cartridge/services/PayPlugServiceConfig');


function PayPlugUpdateRequest(payment_token, paymentID) {
	const cart = BasketMgr.getCurrentBasket();
	this.body = {
		apple_pay: {
			amount: Math.round(cart.getTotalGrossPrice().getValue() * 100),
			payment_token: payment_token,
			billing: {
				first_name: cart.getBillingAddress().getFirstName(),
				last_name: cart.getBillingAddress().getLastName(),
				email: cart.getCustomerEmail(),
				address1: cart.getBillingAddress().getAddress1(),
				postcode: cart.getBillingAddress().getPostalCode(),
				city: cart.getBillingAddress().getCity(),
				country: cart.getBillingAddress().getCountryCode().getValue().toUpperCase(),
				language: Locale.getLocale(request.getLocale()).getLanguage().toLowerCase(),
			},
			shipping: {
				first_name: cart.getDefaultShipment().getShippingAddress().getFirstName(),
				last_name: cart.getDefaultShipment().getShippingAddress().getLastName(),
				mobile_phone_number: PayPlugUtils.formatPhoneNumber(cart.getDefaultShipment().getShippingAddress().getPhone(), cart.getDefaultShipment().getShippingAddress().getCountryCode().getValue().toUpperCase()),
				email: cart.getCustomerEmail(),
				address1: cart.getDefaultShipment().getShippingAddress().getAddress1(),
				postcode: cart.getDefaultShipment().getShippingAddress().getPostalCode(),
				city: cart.getDefaultShipment().getShippingAddress().getCity(),
				country: cart.getDefaultShipment().getShippingAddress().getCountryCode().getValue().toUpperCase(),
				language: Locale.getLocale(request.getLocale()).getLanguage().toLowerCase()
			},
		}
	};
	this.paymentReference = paymentID;
}


PayPlugUpdateRequest.prototype.getRequest = function getRequest() {
	return {
		endpoint: PayPlugServiceConfig.getUpdateEndpoint(this.paymentReference),
		body: this.body
	};
}

module.exports = PayPlugUpdateRequest;
