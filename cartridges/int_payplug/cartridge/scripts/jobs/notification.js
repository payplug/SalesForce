'use strict';

const Order = require('dw/order/Order');
const Logger = require('dw/system/Logger');
const OrderMgr = require('dw/order/OrderMgr');
const Transaction = require('dw/system/Transaction');
const CustomObjectMgr = require('dw/object/CustomObjectMgr');

module.exports.execute = function (args) {
    const payplugNotifications = CustomObjectMgr.getAllCustomObjects('payplugNotification');

    while (payplugNotifications.hasNext()) {
        let notification = payplugNotifications.next();
        let message = notification.getCustom()['payplugLog'];
		let payplugPaymentData = JSON.parse(message);

        var order = OrderMgr.getOrder(payplugPaymentData.metadata.transaction_id);
        Transaction.begin();
        if (order) {
            if (payplugPaymentData.is_paid) {
                order.setPaymentStatus(Order.PAYMENT_STATUS_PAID);
                order.getCustom()['payplugPaymentData'] = message;
				order.getCustom()['pp_pspReference'] = payplugPaymentData.id;
				order.getCustom()['pp_amount'] = payplugPaymentData.amount;
				order.getCustom()['pp_paymentMethod'] = payplugPaymentData.payment_method ? payplugPaymentData.payment_method.type: 'credit card';
                order.addNote('PAYPLUG NOTIFICATION - Success', message);
            } else {
                order.addNote('PAYPLUG NOTIFICATION - NOT PAID', message);
				order.getCustom()['payplugPaymentData'] = message;
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