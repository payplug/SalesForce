'use strict'

const PaymentMgr = require('dw/order/PaymentMgr');

const LocaleHelper = require('~/cartridge/scripts/helpers/LocaleHelper');

function OneyPaymentMethodHelper() { }

/**
 *
 * @param {*} customer from request
 * @param {*} product
 * @returns List of applicable payment methods
 */
OneyPaymentMethodHelper.getOneyApplicablePaymentMethods = function getOneyApplicablePaymentMethods(customer, price) {
	const countryCode = LocaleHelper.getCountryCode();
	if (countryCode) {
		let amount = price / 100;
		var paymentMethods = PaymentMgr.getApplicablePaymentMethods(customer, countryCode, amount);
		return paymentMethods.toArray().filter((pm) => {
			return !empty(pm.custom.PP_paymentMethod.value) && pm.custom.PP_paymentMethod.value.indexOf('oney') !== -1;
		}).map(pm => pm.getCustom()['PP_paymentMethod'].getValue().replace(/^oney_/, ''));
	}

	return [];
}

OneyPaymentMethodHelper.isOneyAvailable = function isOneyAvailable() {
    return PaymentMgr.getActivePaymentMethods().toArray().some((pm) => {
		return !empty(pm.custom.PP_paymentMethod.value) && pm.custom.PP_paymentMethod.value.indexOf('oney') !== -1;
    });
};


module.exports = OneyPaymentMethodHelper;