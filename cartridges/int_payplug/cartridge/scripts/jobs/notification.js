'use strict';

const Order = require('dw/order/Order');
const Logger = require('dw/system/Logger');
const OrderMgr = require('dw/order/OrderMgr');
const StringUtils = require('dw/util/StringUtils');
const Transaction = require('dw/system/Transaction');
const CustomObjectMgr = require('dw/object/CustomObjectMgr');

const PayPlugUtils = require('~/cartridge/scripts/util/PayPlugUtils');

var PayPlugNotifications;

exports.beforeStep = function (params, stepExecution) {
	PayPlugNotifications = CustomObjectMgr.getAllCustomObjects('payplugNotification');
};

/**
 * @returns {number} total count
 */
exports.getTotalCount = function () {
	if (!PayPlugNotifications.getCount()) {
		Logger.info('No notifications found to handle');
	} else {
		Logger.info('{0} step started', 'PayPlugNotification');
	}

	return PayPlugNotifications.getCount();
};

exports.read = function () {
	if (PayPlugNotifications.hasNext()) {
		return PayPlugNotifications.next();
	}
};


exports.process = function (notification) {
	let message = notification.getCustom()['payplugLog'];
	let payplugPaymentData = JSON.parse(message);

	var order = OrderMgr.getOrder(payplugPaymentData.metadata.transaction_id);
	Transaction.begin();
	if (order) {
		if (payplugPaymentData.object === 'refund') {
			handleRefundNotification(order, payplugPaymentData);
		} else {
			handlePaymentNotification(order, payplugPaymentData);
		}
		Logger.info('Process notification for order {0}', payplugPaymentData.metadata.transaction_id);
		CustomObjectMgr.remove(notification);

	} else {
		Logger.info('Order not found {0}', payplugPaymentData.metadata.transaction_id);
		CustomObjectMgr.remove(notification);
	}
	Transaction.commit();
};

exports.write = function (order) {
};

/**
 * @param {boolean} success - job status
 */
exports.afterStep = function (success) {
	if (!empty(PayPlugNotifications)) {
		PayPlugNotifications.close();
	}

	if (!success) {
		Logger.error('{0} step finished unsuccessfully', 'PayPlugNotification');
	} else {
		Logger.info('{0} step finished successfully', 'PayPlugNotification');
	}
};

function handleRefundNotification(order, payplugPaymentData) {
	let message = JSON.stringify(payplugPaymentData, null, 2);
	order.getCustom()['pp_amountRefunded'] = order.getCustom()['pp_amountRefunded'] + (payplugPaymentData.amount / 100);
	order.addNote('PAYPLUG NOTIFICATION - Refund', message);
}


function handlePaymentNotification(order, payplugPaymentData) {
	let message = JSON.stringify(payplugPaymentData, null, 2);
	if (payplugPaymentData.is_paid ||
		(!empty(payplugPaymentData.authorization) && payplugPaymentData.authorization.authorized_amount !== 0 && !empty(payplugPaymentData.authorization.authorized_at))) {
		order.setPaymentStatus(order.PAYMENT_STATUS_PAID);
		order.getCustom()['payplugPaymentData'] = message;
		order.getCustom()['pp_pspReference'] = payplugPaymentData.id;
		order.getCustom()['pp_amount'] = payplugPaymentData.amount;
		order.getCustom()['pp_paymentMethod'] = payplugPaymentData.payment_method ? payplugPaymentData.payment_method.type : 'credit card';
		order.getCustom()['pp_limitCapture'] = payplugPaymentData.authorization ?
			StringUtils.formatCalendar(new dw.util.Calendar(new Date((payplugPaymentData.authorization.expires_at * 1000))), request.locale, dw.util.Calendar.LONG_DATE_PATTERN) : 'none';
		order.addNote('PAYPLUG NOTIFICATION - Success', message);
		if (payplugPaymentData.is_paid) {
			order.getCustom()['pp_isCaptured'] = true;
		}
	} else {
		order.addNote('PAYPLUG NOTIFICATION - NOT PAID', message);
		order.getCustom()['payplugPaymentData'] = message;
	}
	if (!empty(payplugPaymentData.card.id)) {
		order.addNote('PAYPLUG CARD', 'Saving Credit card on customer with id: ' + payplugPaymentData.card.id)
		PayPlugUtils.saveCreditCard(order, payplugPaymentData);
	}
}