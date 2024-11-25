'use strict';

const PayPlugAPIProvider = require("*/cartridge/services/api/PayPlugAPIProvider");
const PayPlugPaymentAPI = PayPlugAPIProvider.get("PayPlug");

function PayPlugPaymentModel() {}

/**
 *
 * @return Payment formToken
 */

PayPlugPaymentModel.prototype.createPayment = function createPayment(paymentMethod) {
    const paymentStatus = PayPlugPaymentAPI.createPayment(paymentMethod);

    return paymentStatus;
}

PayPlugPaymentModel.prototype.capturePayment = function capturePayment(order) {
    const paymentStatus = PayPlugPaymentAPI.capturePayment(order);

    return paymentStatus;
}

module.exports = PayPlugPaymentModel;