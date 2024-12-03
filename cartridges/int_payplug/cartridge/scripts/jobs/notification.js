'use strict';

const Order = require('dw/order/Order');
const Logger = require('dw/system/Logger');
const OrderMgr = require('dw/order/OrderMgr');
const StringUtils = require('dw/util/StringUtils');
const Transaction = require('dw/system/Transaction');
const CustomObjectMgr = require('dw/object/CustomObjectMgr');

const PayPlugUtils = require('~/cartridge/scripts/util/PayPlugUtils');

module.exports.execute = function (args) {
    const payplugNotifications = CustomObjectMgr.getAllCustomObjects('payplugNotification');

    while (payplugNotifications.hasNext()) {
        let notification = payplugNotifications.next();
        let message = notification.getCustom()['payplugLog'];
		let payplugPaymentData = JSON.parse(message);

        var order = OrderMgr.getOrder(payplugPaymentData.metadata.transaction_id);
        Transaction.begin();
        if (order) {
            if (payplugPaymentData.is_paid ||
				(!empty(payplugPaymentData.authorization) && payplugPaymentData.authorization.authorized_amount !== 0)) {
                order.setPaymentStatus(Order.PAYMENT_STATUS_PAID);
                order.getCustom()['payplugPaymentData'] = message;
				order.getCustom()['pp_pspReference'] = payplugPaymentData.id;
				order.getCustom()['pp_amount'] = payplugPaymentData.amount;
				order.getCustom()['pp_paymentMethod'] = payplugPaymentData.payment_method ? payplugPaymentData.payment_method.type: 'credit card';
				order.getCustom()['pp_limitCapture'] = payplugPaymentData.authorization ?
					StringUtils.formatCalendar(new dw.util.Calendar(new Date((payplugPaymentData.authorization.expires_at * 1000))), request.locale, dw.util.Calendar.LONG_DATE_PATTERN) : 'none';
                order.addNote('PAYPLUG NOTIFICATION - Success', message);
            } else {
                order.addNote('PAYPLUG NOTIFICATION - NOT PAID', message);
				order.getCustom()['payplugPaymentData'] = message;
            }
			if (!empty(payplugPaymentData.card.id)) {
				order.addNote('PAYPLUG CARD', 'Saving Credit card on customer with id: ' + payplugPaymentData.card.id)
				PayPlugUtils.saveCreditCard(order, payplugPaymentData);
			}
            Logger.info('Process notification for order {0}', payplugPaymentData.metadata.transaction_id);
            CustomObjectMgr.remove(notification);

        } else {
            Logger.info('Order not found {0}', payplugPaymentData.metadata.transaction_id);
            CustomObjectMgr.remove(notification);
        }
        Transaction.commit();
    }

    payplugNotifications.close();
}