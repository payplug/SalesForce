'use strict';

// const server = require('server');
const Site = require('dw/system/Site');
const Locale = require('dw/util/Locale');
const URLUtils = require('dw/web/URLUtils');
const Calendar = require('dw/util/Calendar');
const Encoding = require('dw/crypto/Encoding');
const BasketMgr = require('dw/order/BasketMgr');
const PaymentManager = require('dw/order/PaymentMgr');

/** Scripts Declaration */
const PayPlugUtils = require('~/cartridge/scripts/util/PayPlugUtils');
const PayPlugServiceConfig = require('*/cartridge/services/PayPlugServiceConfig');


function PayPlugPaymentRequest(paymentMethod, creditCardID) {
	const ppPaymentMethod = paymentMethod.getCustom()['PP_paymentMethod'].getValue() || 'credit_card';
	const integrationMode = PayPlugUtils.getIntegrationMode(ppPaymentMethod);
	this.cart = BasketMgr.getCurrentBasket();
	this.body = {
		currency: this.cart.getCurrencyCode(),
		billing: {
			title: this.cart.getBillingAddress().getTitle(),
			first_name: this.cart.getBillingAddress().getFirstName(),
			last_name: this.cart.getBillingAddress().getLastName(),
			mobile_phone_number: PayPlugUtils.formatPhoneNumber(this.cart.getBillingAddress().getPhone(), this.cart.getBillingAddress().getCountryCode().getValue().toUpperCase()),
			email: this.cart.getCustomerEmail(),
			landline_phone_number: null,
			address1: this.cart.getBillingAddress().getAddress1(),
			address2: this.cart.getBillingAddress().getAddress2(),
			company_name: this.cart.getBillingAddress().getCompanyName(),
			postcode: this.cart.getBillingAddress().getPostalCode(),
			city: this.cart.getBillingAddress().getCity(),
			country: this.cart.getBillingAddress().getCountryCode().getValue().toUpperCase(),
			language: Locale.getLocale(request.getLocale()).getLanguage().toLowerCase(),
		},
		shipping: {
			title: this.cart.getDefaultShipment().getShippingAddress().getTitle(),
			first_name: this.cart.getDefaultShipment().getShippingAddress().getFirstName(),
			last_name: this.cart.getDefaultShipment().getShippingAddress().getLastName(),
			mobile_phone_number: PayPlugUtils.formatPhoneNumber(this.cart.getDefaultShipment().getShippingAddress().getPhone(), this.cart.getDefaultShipment().getShippingAddress().getCountryCode().getValue().toUpperCase()),
			landline_phone_number: null,
			email: this.cart.getCustomerEmail(),
			address1: this.cart.getDefaultShipment().getShippingAddress().getAddress1(),
			address2: this.cart.getDefaultShipment().getShippingAddress().getAddress2(),
			company_name: this.cart.getDefaultShipment().getShippingAddress().getCompanyName() || 'company',
			postcode: this.cart.getDefaultShipment().getShippingAddress().getPostalCode(),
			city: this.cart.getDefaultShipment().getShippingAddress().getCity(),
			country: this.cart.getDefaultShipment().getShippingAddress().getCountryCode().getValue().toUpperCase(),
			language: Locale.getLocale(request.getLocale()).getLanguage().toLowerCase(),
			delivery_type: 'OTHER',
		},
		payment_context: {
			cart: _getCartItemInfo(this.cart)
		},
		hosted_payment: {
			return_url: integrationMode === 'HPP' ? URLUtils.https('PayPlug-ReturnURL').abs().toString() :
				URLUtils.https('PayPlug-PlaceOrderLightbox', 'paymentMethodID', paymentMethod.getID()).abs().toString(),
			cancel_url: URLUtils.https('PayPlug-CancelURL').abs().toString(),
		},
		force_3ds: Site.getCurrent().getCustomPreferenceValue('PP_force3DS'),
		allow_save_card: customer.isAuthenticated() && Site.getCurrent().getCustomPreferenceValue('PP_oneClickPayment') || false,
		notification_url: URLUtils.https('PayPlug-Notification').abs().toString(),
		initiator: 'PAYER',
		metadata: {
			transaction_id: PayPlugUtils.createOrderNo(),
			customer_id: customer.isAuthenticated() ? customer.getID() : '',
		}
	}

	this.body.amount = Math.round(this.cart.getTotalGrossPrice().getValue() * 100);

	const isDifferedPaymentEnabled = Site.getCurrent().getCustomPreferenceValue('PP_differedPayment');

	if (ppPaymentMethod !== 'credit_card') {
		this.body.payment_method = ppPaymentMethod;
		this.body.allow_save_card = false;
		if (ppPaymentMethod.indexOf('oney') !== -1) {
			this.body.authorized_amount = this.body.amount;
			this.body.auto_capture = false;
			delete this.body.amount;
		}
	} else {
		if (!empty(creditCardID)) {
			this.body.payment_method = creditCardID;
			this.body.allow_save_card = false;
		}
		if (isDifferedPaymentEnabled) {
			this.body.authorized_amount = this.body.amount;
			this.body.auto_capture = false;
			delete this.body.amount;
		}
	}

	if (integrationMode === 'integrated' && (this.body.payment_method === 'credit_card' || empty(this.body.payment_method))) {
		this.body.integration = 'INTEGRATED_PAYMENT';
		delete this.body.hosted_payment.cancel_url;
	}

	if (ppPaymentMethod === 'apple_pay') {
		const bytes = new dw.util.Bytes(JSON.stringify({ 'apple_pay_domain': Site.getCurrent().getCustomPreferenceValue('PP_ApplePayDomain') }), 'UTF-8');
		this.body.payment_context.apple_pay = {
			domain_name: Site.getCurrent().getCustomPreferenceValue('PP_ApplePayDomain'),
			application_data: Encoding.toBase64(bytes)
		}
	}
}

function _getCartItemInfo(cart) {
	var calendar = new Calendar();
	const shippingMethod = cart.getDefaultShipment().getShippingMethod();
	const expectedDelivery = 0;

	calendar.add(Calendar.DAY_OF_MONTH, expectedDelivery);
	// Formatte la date en YYYY-MM-DD
	const year = calendar.get(Calendar.YEAR);
	var month = calendar.get(Calendar.MONTH) + 1; // Les mois commencent à 0
	var day = calendar.get(Calendar.DAY_OF_MONTH);

	// Ajout de zéros devant les valeurs si nécessaire
	month = month < 10 ? '0' + month : month;
	day = day < 10 ? '0' + day : day;

	// Retourne la date au format YYYY-MM-DD
	const expected_delivery_date = year + '-' + month + '-' + day;
	return cart.getProductLineItems().toArray().map(function (productLineItem) {
		let product = productLineItem.getProduct();
		return {
			brand: product.getBrand() || 'none',
			expected_delivery_date: expected_delivery_date,
			delivery_label: !empty(shippingMethod) ? shippingMethod.getID() + '_' + shippingMethod.getDisplayName() : '',
			delivery_type: 'carrier',
			merchant_item_id: productLineItem.getProductID(),
			name: productLineItem.getProductName(),
			price: Math.round(productLineItem.getPrice().getValue() * 100) / productLineItem.getQuantityValue(),
			quantity: productLineItem.getQuantityValue(),
			total_amount: Math.round(productLineItem.getPrice().getValue() * 100),
		};
	});
}


PayPlugPaymentRequest.prototype.getRequest = function getRequest() {
	return {
		endpoint: PayPlugServiceConfig.getPaymentRequestEndpoint(),
		body: this.body
	};
}

module.exports = PayPlugPaymentRequest;
