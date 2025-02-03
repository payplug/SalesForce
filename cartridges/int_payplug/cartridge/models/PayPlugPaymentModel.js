'use strict';

const PayPlugAPIProvider = require("*/cartridge/services/api/PayPlugAPIProvider");
const PayPlugPaymentAPI = PayPlugAPIProvider.get("PayPlug");

function PayPlugPaymentModel() { }

/**
 *
 * @return Payment formToken
 */

PayPlugPaymentModel.prototype.createPayment = function createPayment(paymentMethod, creditCardID) {
	const paymentStatus = PayPlugPaymentAPI.createPayment(paymentMethod, creditCardID);

	return paymentStatus;
}

PayPlugPaymentModel.prototype.removeCustomerCardFromWallet = function removeCustomerCardFromWallet(cardID) {
	const status = PayPlugPaymentAPI.removeCustomerCardFromWallet(cardID);

	return status;
}

PayPlugPaymentModel.prototype.capturePayment = function capturePayment(order) {
	const paymentStatus = PayPlugPaymentAPI.capturePayment(order);

	return paymentStatus;
}

PayPlugPaymentModel.prototype.updatePayment = function updatePayment(paymentToken, paymentID) {
	const paymentStatus = PayPlugPaymentAPI.updatePayment(paymentToken, paymentID);

	return paymentStatus;
}

PayPlugPaymentModel.prototype.cancelPayment = function cancelPayment(paymentID) {
	const paymentStatus = PayPlugPaymentAPI.cancelPayment(paymentID);

	return paymentStatus;
}

PayPlugPaymentModel.prototype.retrievePayment = function retrievePayment(paymentID) {
	const paymentStatus = PayPlugPaymentAPI.retrievePayment(paymentID);

	return paymentStatus;
}

PayPlugPaymentModel.prototype.refundPayment = function refundPayment(amount, order) {
	const paymentStatus = PayPlugPaymentAPI.createRefund(amount, order);

	return paymentStatus;
}

PayPlugPaymentModel.prototype.oneySimulation = function oneySimulation(amount) {
	const status = PayPlugPaymentAPI.oneySimulation(amount);

	return status;
}

module.exports = PayPlugPaymentModel;