'use strict';

/**
 * API Includes
 */
const Logger = require('dw/system/Logger');

/** Scripts Declaration */
const ServiceModel = require('~/cartridge/services/models/ServiceModel');
const PayPlugServiceConfig = require('~/cartridge/services/PayPlugServiceConfig');
const PayPlugPaymentRequest = require('~/cartridge/services/requests/PayPlugPaymentRequest');
const PayPlugCaptureRequest = require('~/cartridge/services/requests/PayPlugCaptureRequest');
const PayPlugCreateRefundRequest = require('~/cartridge/services/requests/PayPlugCreateRefundRequest');
const PayPlugOneySimulationRequest = require('~/cartridge/services/requests/PayPlugOneySimulationRequest');
const PayPlugRemoveCustomerCardRequest = require('~/cartridge/services/requests/PayPlugRemoveCustomerCardRequest');


/** Constant Declaration */
const LOGGER_PayPlug = Logger.getLogger("PayPlug", "service");
const OVERLAY_RESPONSE = {
	PaymentResponse: require('*/cartridge/services/responses/PaymentResponse'),
    CaptureResponse: require('*/cartridge/services/responses/CaptureResponse'),
	CreateRefund : require('*/cartridge/services/responses/CreateRefundResponse'),
    OneySimulationResponse: require('*/cartridge/services/responses/OneySimulationResponse'),
    RemoveCustomerCardResponse: require('*/cartridge/services/responses/RemoveCustomerCardResponse'),
}

function PayPlugPaymentAPI() {}

PayPlugPaymentAPI.prototype.createPayment = function createPayment(paymentMethod, creditCardID) {
	const serviceModel = new ServiceModel(
        PayPlugServiceConfig.getServiceName(),
        require('~/cartridge/services/callbacks/PayPlugCallbacks.js').postCallback()
    );
    serviceModel.setLogger(LOGGER_PayPlug);
    return serviceModel.executeCall(new PayPlugPaymentRequest(paymentMethod, creditCardID).getRequest(), OVERLAY_RESPONSE.PaymentResponse);
}

PayPlugPaymentAPI.prototype.capturePayment = function capturePayment(order) {
	const serviceModel = new ServiceModel(
        PayPlugServiceConfig.getServiceName(),
        require('~/cartridge/services/callbacks/PayPlugCallbacks.js').patchCallback()
    );
    serviceModel.setLogger(LOGGER_PayPlug);
    return serviceModel.executeCall(new PayPlugCaptureRequest(order).getRequest(), OVERLAY_RESPONSE.CaptureResponse);
}

PayPlugPaymentAPI.prototype.removeCustomerCardFromWallet = function removeCustomerCardFromWallet(cardID) {
	const serviceModel = new ServiceModel(
        PayPlugServiceConfig.getServiceName(),
        require('~/cartridge/services/callbacks/PayPlugCallbacks.js').deleteCallback()
    );
    serviceModel.setLogger(LOGGER_PayPlug);
    return serviceModel.executeCall(new PayPlugRemoveCustomerCardRequest(cardID).getRequest(), OVERLAY_RESPONSE.RemoveCustomerCardResponse);
}

PayPlugPaymentAPI.prototype.createRefund = function createRefund(amount, order) {
	const serviceModel = new ServiceModel(
        PayPlugServiceConfig.getServiceName(),
        require('~/cartridge/services/callbacks/PayPlugCallbacks.js').postCallback()
    );
    serviceModel.setLogger(LOGGER_PayPlug);
    return serviceModel.executeCall(new PayPlugCreateRefundRequest(amount, order).getRequest(), OVERLAY_RESPONSE.CreateRefund);
}

PayPlugPaymentAPI.prototype.oneySimulation = function oneySimulation(amount) {
	const serviceModel = new ServiceModel(
        PayPlugServiceConfig.getServiceName(),
        require('~/cartridge/services/callbacks/PayPlugCallbacks.js').postCallback()
    );
    serviceModel.setLogger(LOGGER_PayPlug);
    return serviceModel.executeCall(new PayPlugOneySimulationRequest(amount).getRequest(), OVERLAY_RESPONSE.OneySimulationResponse);
}

module.exports = PayPlugPaymentAPI;
