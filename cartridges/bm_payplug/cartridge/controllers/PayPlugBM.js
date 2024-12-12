'use strict';

var OrderMgr = require('dw/order/OrderMgr');
var Resource = require('dw/web/Resource');
var URLUtils = require('dw/web/URLUtils');
var ISML = require('dw/template/ISML');
var Order = require('dw/order/Order');

const PayPlugPaymentModel = require('*/cartridge/models/PayPlugPaymentModel');

function HandleOrders() {
	var responseMessage = '';
	if (!request.httpParameterMap.responseMessage.empty) {
		responseMessage = request.httpParameterMap.responseMessage;
	}

	var operationSuccess = '';
	if (!request.httpParameterMap.operationSuccess.empty) {
		operationSuccess = request.httpParameterMap.operationSuccess;
	}

	if (!request.httpParameterMap.viewOrder.empty) {
		var order = OrderMgr.getOrder(request.httpParameterMap.viewOrder);


		ISML.renderTemplate('order/payplugOrder', {
			order: order,
			responseMessage: responseMessage,
			operationSuccess: operationSuccess
		});
	} else {
		var orders = OrderMgr.searchOrders(
			"custom.isPayPlug = {0}",
			"creationDate desc",
			true
		);

		ISML.renderTemplate('order/payplugOrders', { orders: orders });
	}
}

function HandleOrdersForm() {
	var message;
	var operationSuccess;
	var ppActions = session.forms.payplugActions;
	if (ppActions.valid) {
		const PayPlugPayment = new PayPlugPaymentModel();
		var order = OrderMgr.getOrder(ppActions.ppOrder.htmlValue);
		if (ppActions.ppOrderRefundSubmit.submitted) {
			var refundAmount;

			if (!ppActions.ppOrderRefundAmount.htmlValue) {
				refundAmount = parseInt(order.totalGrossPrice * 100, 10);
				if (!empty(order.custom.pp_amountRefunded)) {
					refundAmount -= parseInt(order.custom.pp_amountRefunded * 100, 10);
				}
			} else {
				refundAmount = parseInt(ppActions.ppOrderRefundAmount.htmlValue * 100, 10);
			}

			let status = PayPlugPayment.refundPayment(refundAmount, order);
			if (status) {
				message = Resource.msg('order.refundSuccess', 'locale', null);
				operationSuccess = true;
			} else {
				message = Resource.msg('order.refundFail', 'locale', null);
				operationSuccess = false;
			}
		}

		if (ppActions.ppOrderCaptureSubmit.submitted) {
			let status = PayPlugPayment.capturePayment(order);
			if (status) {
				message = Resource.msg('order.captureSuccess', 'locale', null);
				operationSuccess = true;
			} else {
				message = Resource.msg('order.captureFail', 'locale', null);
				operationSuccess = false;
			}

		}

		var redirectUrl = URLUtils.url('PayPlugBM-HandleOrders');
		// Redirect in order to lose the ability to refresh the page and redo the action
		ISML.renderTemplate('redirectToOrder', {
			redirectUrl: redirectUrl,
			orderNo: order.orderNo,
			message: message,
			operationSuccess: operationSuccess
		});
	}
}

/*
 * Web exposed methods
 */
exports.HandleOrders = HandleOrders;
exports.HandleOrders.public = true;

exports.HandleOrdersForm = HandleOrdersForm;
exports.HandleOrdersForm.public = true;