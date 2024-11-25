'use strict';

function PaymentResponse(response) {
    this.response = response;
    this.paymentURL = this._setPaymentURL();

}

PaymentResponse.prototype._setPaymentURL = function _setPaymentURL ()
{
    return this.response.hosted_payment.payment_url;
}

PaymentResponse.prototype.getPaymentURL = function getPaymentURL ()
{
    return this.paymentURL;
}


module.exports = PaymentResponse;