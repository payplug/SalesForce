'use strict';

const Site = require('dw/system/Site');
const PaymentMgr = require('dw/order/PaymentMgr');
const PaymentInstrument = require('dw/order/PaymentInstrument');

const collections = require('*/cartridge/scripts/util/collections');
const PayPlugUtils = require('~/cartridge/scripts/util/PayPlugUtils');

/**
 * Creates an array of objects containing applicable payment methods
 * @param {dw.util.ArrayList<dw.order.dw.order.PaymentMethod>} paymentMethods - An ArrayList of
 *      applicable payment methods that the user could use for the current basket.
 * @returns {Array} of object that contain information about the applicable payment methods for the
 *      current cart
 */
function applicablePaymentMethods(paymentMethods) {
	return collections.map(paymentMethods, function (method) {
		let paymentMethod = method.getCustom()['PP_paymentMethod'].getValue() || 'credit_card';
		return {
			ID: method.ID,
			name: method.name,
			isPayPlug: PayPlugUtils.isPaymentMethodPayPlug(method),
			isCreditCard: paymentMethod === 'credit_card',
			isApplePay: paymentMethod === 'apple_pay',
			integrationMode: paymentMethod.indexOf('oney') !== -1 ? 'HPP' : Site.getCurrent().getCustomPreferenceValue('PP_integrationMode').getValue(),
			img: method.getImage() ? method.getImage().getHttpsURL() : false
		};
	});
}

/**
 * Creates an array of objects containing applicable credit cards
 * @param {dw.util.Collection<dw.order.PaymentCard>} paymentCards - An ArrayList of applicable
 *      payment cards that the user could use for the current basket.
 * @returns {Array} Array of objects that contain information about applicable payment cards for
 *      current basket.
 */
function applicablePaymentCards(paymentCards) {
	return collections.map(paymentCards, function (card) {
		return {
			cardType: card.cardType,
			name: card.name
		};
	});
}

/**
 * Creates an array of objects containing selected payment information
 * @param {dw.util.ArrayList<dw.order.PaymentInstrument>} selectedPaymentInstruments - ArrayList
 *      of payment instruments that the user is using to pay for the current basket
 * @returns {Array} Array of objects that contain information about the selected payment instruments
 */
function getSelectedPaymentInstruments(selectedPaymentInstruments) {
	return collections.map(selectedPaymentInstruments, function (paymentInstrument) {
		let paymentMethod = PaymentMgr.getPaymentMethod(paymentInstrument.paymentMethod);
		var results = {
			paymentMethod: paymentInstrument.paymentMethod,
			amount: paymentInstrument.paymentTransaction.amount.value,
			isPayPlug: (paymentMethod ? PayPlugUtils.isPaymentMethodPayPlug(paymentMethod) : false)
		};
		if (paymentInstrument.paymentMethod === 'CREDIT_CARD') {
			results.lastFour = paymentInstrument.creditCardNumberLastDigits;
			results.owner = paymentInstrument.creditCardHolder;
			results.expirationYear = paymentInstrument.creditCardExpirationYear;
			results.type = paymentInstrument.creditCardType;
			results.maskedCreditCardNumber = paymentInstrument.maskedCreditCardNumber;
			results.expirationMonth = paymentInstrument.creditCardExpirationMonth;
		} else if (paymentInstrument.paymentMethod === 'GIFT_CERTIFICATE') {
			results.giftCertificateCode = paymentInstrument.giftCertificateCode;
			results.maskedGiftCertificateCode = paymentInstrument.maskedGiftCertificateCode;
		}

		return results;
	});
}

/**
 * Payment class that represents payment information for the current basket
 * @param {dw.order.Basket} currentBasket - the target Basket object
 * @param {dw.customer.Customer} currentCustomer - the associated Customer object
 * @param {string} countryCode - the associated Site countryCode
 * @constructor
 */
function Payment(currentBasket, currentCustomer, countryCode) {
	var paymentAmount = currentBasket.totalGrossPrice;
	var paymentMethods = PaymentMgr.getApplicablePaymentMethods(
		currentCustomer,
		countryCode,
		paymentAmount.value
	);
	var paymentCards = PaymentMgr.getPaymentMethod(PaymentInstrument.METHOD_CREDIT_CARD)
		.getApplicablePaymentCards(currentCustomer, countryCode, paymentAmount.value);
	var paymentInstruments = currentBasket.paymentInstruments;

	// TODO: Should compare currentBasket and currentCustomer and countryCode to see
	//     if we need them or not
	this.applicablePaymentMethods =
		paymentMethods ? applicablePaymentMethods(paymentMethods) : null;

	this.applicablePaymentCards =
		paymentCards ? applicablePaymentCards(paymentCards) : null;

	this.selectedPaymentInstruments = paymentInstruments ?
		getSelectedPaymentInstruments(paymentInstruments) : null;
}

module.exports = Payment;