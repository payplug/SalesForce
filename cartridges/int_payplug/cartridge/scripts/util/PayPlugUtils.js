'use strict';

const Calendar = require('dw/util/Calendar');
const OrderMgr = require('dw/order/OrderMgr');
const BasketMgr = require('dw/order/BasketMgr');
const PaymentMgr = require('dw/order/PaymentMgr');
const StringUtils = require('dw/util/StringUtils');
const Transaction = require('dw/system/Transaction');
const CustomObjectMgr = require('dw/object/CustomObjectMgr');

function PayPlugUtils() { }

PayPlugUtils.isPaymentMethodPayPlug = function isPaymentMethodPayPlug(paymentMethod) {
	return (paymentMethod.getPaymentProcessor().getID() === 'PAYPLUG');
}

PayPlugUtils.getPaymentMethodByID = function getPaymentMethodByID(paymentMethodID) {
	return PaymentMgr.getPaymentMethod(paymentMethodID);
}

PayPlugUtils.createOrderNo = function createOrderNo() {
	const basket = BasketMgr.getCurrentBasket();
	if (empty(basket.getCustom()['payplugOrderNo'])) {
		Transaction.wrap(function () {
			basket.getCustom()['payplugOrderNo'] = OrderMgr.createOrderNo();
		});
	}

	return basket.getCustom()['payplugOrderNo'];
}

PayPlugUtils.saveCreditCard = function saveCreditCard(order, payplugPaymentData) {
	const customer = order.getCustomer();
	if (isTokenLinkedToCustomer(order.getCustomer(), payplugPaymentData.card.id)) {
		return;
	}
	const wallet = customer.getProfile().getWallet();
	const newCreditCard = wallet.createPaymentInstrument('PAYPLUG_ONECLICK');
	newCreditCard.setCreditCardHolder(payplugPaymentData.billing.last_name + ' ' + payplugPaymentData.billing.first_name);
	newCreditCard.setCreditCardNumber("**** **** **** " + payplugPaymentData.card.last4);
	newCreditCard.setCreditCardExpirationMonth(payplugPaymentData.card.exp_month);
	newCreditCard.setCreditCardExpirationYear(payplugPaymentData.card.exp_year);
	newCreditCard.setCreditCardType(payplugPaymentData.card.brand);
	newCreditCard.setCreditCardToken(payplugPaymentData.card.id);
}

function isTokenLinkedToCustomer(customer, token) {
	if (!customer || !customer.profile || !token) {
		return false;
	}

	var paymentInstruments = customer.profile.wallet.paymentInstruments.iterator();

	while (paymentInstruments.hasNext()) {
		var paymentInstrument = paymentInstruments.next();
		var storedToken = paymentInstrument.getCreditCardToken();

		if (storedToken && storedToken === token) {
			return true;
		}
	}

	return false;
}

PayPlugUtils.formatPhoneNumber = function formatPhoneNumber(phoneNumber, countryCode) {
	const cleanedNumber = phoneNumber.replace(/[^0-9]/g, '');

	// Define country-specific prefixes
	const prefixes = {
		FR: '+33',
		UK: '+44',
		IT: '+39'
	};

	// Check if the country code is supported
	if (!prefixes[countryCode]) {
		return null;
	}

	let formattedNumber;

	switch (countryCode) {
		case 'FR': // France
			// Remove leading zero for French numbers
			formattedNumber = cleanedNumber.startsWith('0')
				? prefixes[countryCode] + cleanedNumber.slice(1)
				: prefixes[countryCode] + cleanedNumber;
			break;

		case 'UK': // United Kingdom
			// Remove leading zero for UK numbers
			formattedNumber = cleanedNumber.startsWith('0')
				? prefixes[countryCode] + cleanedNumber.slice(1)
				: prefixes[countryCode] + cleanedNumber;
			break;

		case 'IT': // Italy
			// Italian numbers do not require leading zero removal
			formattedNumber = prefixes[countryCode] + cleanedNumber;
			break;

		default:
			return null;
	}

	return formattedNumber;
}

PayPlugUtils.createNotificationCustomObject = function createNotificationCustomObject(notificationJson) {
	let keyValue = notificationJson.id + "-" + StringUtils.formatCalendar(new Calendar(), "yyyyMMddhhmmss");

	Transaction.wrap(function () {
		var payplugNotification = CustomObjectMgr.createCustomObject('payplugNotification', keyValue);
		payplugNotification.getCustom()['payplugLog'] = JSON.stringify(notificationJson, null, 3);
		payplugNotification.getCustom()['id'] = notificationJson.id;
	});
}

module.exports = PayPlugUtils;