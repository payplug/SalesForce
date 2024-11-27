'use strict';

const server = require('server');
const Site = require('dw/system/Site');
const Locale = require('dw/util/Locale');
const URLUtils = require('dw/web/URLUtils');
const Calendar = require('dw/util/Calendar');
const BasketMgr = require('dw/order/BasketMgr');
const PaymentManager = require('dw/order/PaymentMgr');

/** Scripts Declaration */
const PayPlugUtils = require('~/cartridge/scripts/util/PayPlugUtils');
const PayPlugServiceConfig = require('*/cartridge/services/PayPlugServiceConfig');


function PayPlugPaymentRequest(paymentMethod, formChanged) {
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
			company_name: this.cart.getDefaultShipment().getShippingAddress().getCompanyName(),
			postcode: this.cart.getDefaultShipment().getShippingAddress().getPostalCode(),
			city: this.cart.getDefaultShipment().getShippingAddress().getCity(),
			country: this.cart.getDefaultShipment().getShippingAddress().getCountryCode().getValue().toUpperCase(),
			language: Locale.getLocale(request.getLocale()).getLanguage().toLowerCase(),
		},
		payment_context: {
			cart: _getCartItemInfo(this.cart)
		},
		hosted_payment: {
			return_url: Site.getCurrent().getCustomPreferenceValue('PP_integrationMode').getValue() === 'lightbox' ? URLUtils.https('PayPlug-PlaceOrderLightbox', 'paymentMethodID', paymentMethod.getID()).abs().toString() :
			URLUtils.https('PayPlug-ReturnURL').abs().toString(),
			cancel_url: URLUtils.https('PayPlug-CancelURL').abs().toString(),
		},
		force_3ds: Site.getCurrent().getCustomPreferenceValue('PP_force3DS'),
		allow_save_card: Site.getCurrent().getCustomPreferenceValue('PP_allowSaveCard'),
		notification_url: URLUtils.https('PayPlug-Notification').abs().toString(),
		initiator: 'PAYER',
		metadata: {
			transaction_id: PayPlugUtils.createOrderNo(),
			customer_id: customer.isAuthenticated() ? customer.getID() : '',
		}
    }

	this.body.amount = Math.round(this.cart.getTotalGrossPrice().getValue() * 100);

	const ppPaymentMethod = paymentMethod.getCustom()['PP_paymentMethod'].getValue();
	const isDifferedPaymentEnabled = Site.getCurrent().getCustomPreferenceValue('PP_differedPayment');

	if (ppPaymentMethod && ppPaymentMethod !== 'credit_card') {
		this.body.payment_method = ppPaymentMethod;
		this.body.allow_save_card = false;
	} else {
		if (!empty(server.forms.getForm('billing').payplugCreditCard.value)) {
			this.body.payment_method = server.forms.getForm('billing').payplugCreditCard.value;
			this.body.allow_save_card = false;
		}
		if (isDifferedPaymentEnabled) {
			this.body.authorized_amount = this.body.amount;
			this.body.auto_capture = false;
			delete this.body.amount;
		}
	}
}

function _getCartItemInfo(cart) {
	var calendar = new Calendar();
	const shippingMethod = cart.getDefaultShipment().getShippingMethod();
	const expectedDelivery = (!empty(shippingMethod) && !empty(shippingMethod.getCustom()['PP_deliveryDate'])) ? shippingMethod.getCustom()['PP_deliveryDate'] : 0;

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
			delivery_type: (!empty(shippingMethod) && !empty(shippingMethod.getCustom()['PP_deliveryType'].getValue())) ? shippingMethod.getCustom()['PP_deliveryType'].getValue() : 'carrier',
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
