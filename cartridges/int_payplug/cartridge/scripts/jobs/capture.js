'use strict';

const Order = require('dw/order/Order');
const Logger = require('dw/system/Logger');
const Status = require('dw/system/Status');
const OrderMgr = require('dw/order/OrderMgr');
const StringUtils = require('dw/util/StringUtils');

const PayPlugPaymentModel = require('~/cartridge/models/PayPlugPaymentModel');

var ordersToCapture;

exports.beforeStep = function (params, stepExecution) {
	let date = new Date();
	date.setDate(date.getDate() + 5);
	const dateToCapture = StringUtils.formatCalendar(new dw.util.Calendar(date), request.locale, dw.util.Calendar.LONG_DATE_PATTERN)

	ordersToCapture = OrderMgr.searchOrders('custom.pp_limitCapture = {0} AND custom.pp_isCaptured != {1} AND paymentStatus = {2}', 'creationDate desc', dateToCapture, true, Order.PAYMENT_STATUS_PAID);
};

/**
 * @returns {number} total count
 */
exports.getTotalCount = function () {
	if (!ordersToCapture.getCount()) {
		Logger.info('No orders found to handle');
	} else {
		Logger.info('{0} step started', 'PayPlugCapture');
	}

	return ordersToCapture.getCount();
};

exports.read = function () {
	if (ordersToCapture.hasNext()) {
		return ordersToCapture.next();
	}
};


exports.process = function (order) {
	Logger.info('Capture Order: {0}', order.getOrderNo());
	const PayPlugPayment = new PayPlugPaymentModel();
	PayPlugPayment.capturePayment(order);
};

exports.write = function (order) {
};

/**
 * @param {boolean} success - job status
 */
exports.afterStep = function (success) {
	if (!empty(ordersToCapture)) {
		ordersToCapture.close();
	}

	if (!success) {
		Logger.error('{0} step finished unsuccessfully', 'PayPlugCapture');
	} else {
		Logger.info('{0} step finished successfully', 'PayPlugCapture');
	}
};
