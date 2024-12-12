'use strict';

function PaymentResponse(response) {
	this.response = response;
	this.paymentURL = this._setPaymentURL();
	this.paymentID = this._setPaymentID();
}

PaymentResponse.prototype._setPaymentURL = function _setPaymentURL() {
	return this.response.hosted_payment ? this.response.hosted_payment.payment_url : null;
}

PaymentResponse.prototype.getPaymentURL = function getPaymentURL() {
	return this.paymentURL;
}

PaymentResponse.prototype._setPaymentID = function _setPaymentURL() {
	return this.response.id;
}

PaymentResponse.prototype.getPaymentID = function getPaymentID() {
	return this.paymentID;
}



module.exports = PaymentResponse;