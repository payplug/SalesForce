'use strict';

/** API Include */
const Site = require('dw/system/Site');
const System = require('dw/system/System');
const StringUtils = require('dw/util/StringUtils');

/** Constants Declaration */
const API_VERSION = 'v1';

function PayPlugServiceConfig() { }

PayPlugServiceConfig.getServiceName = function getServiceName() {
    return "PayPlug"
}

PayPlugServiceConfig.getPaymentRequestEndpoint = function getPaymentRequestEndpoint() {
    return StringUtils.format("{0}/payments", API_VERSION);
}

PayPlugServiceConfig.getPaymentUpdatetEndpoint = function getPaymentUpdatetEndpoint(paymentReference) {
    return StringUtils.format("{0}/payments/{1}", API_VERSION, paymentReference);
}

PayPlugServiceConfig.getRemoveCardEndpoint = function getRemoveCardEndpoint(cardID) {
    return StringUtils.format("{0}/cards/{1}", API_VERSION, cardID);
}

PayPlugServiceConfig.getCaptureEndpoint = function getCaptureEndpoint(paymentReference) {
    return StringUtils.format("{0}/payments/{1}", API_VERSION, paymentReference);
}

PayPlugServiceConfig.getCreateRefundEndpoint = function getCreateRefundEndpoint(paymentReference) {
    return StringUtils.format("{0}/payments/{1}/refunds", API_VERSION, paymentReference);
}

module.exports = PayPlugServiceConfig;
