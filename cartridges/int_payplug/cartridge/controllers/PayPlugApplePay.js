'use strict';

const server = require('server');
const Site = require('dw/system/Site');
const Encoding = require('dw/crypto/Encoding');
const BasketMgr = require('dw/order/BasketMgr');
const PaymentManager = require('dw/order/PaymentMgr');

const LocaleHelper = require('~/cartridge/scripts/helpers/LocaleHelper');
const PayPlugPaymentModel = require('~/cartridge/models/PayPlugPaymentModel');

server.get('ApplePayRequest',
	function (req, res, next) {
		const bytes = new dw.util.Bytes(JSON.stringify({ 'apple_pay_domain': Site.getCurrent().getCustomPreferenceValue('PP_ApplePayDomain')}), 'UTF-8');
		const cart = BasketMgr.getCurrentBasket();
		const payload = {
			countryCode: LocaleHelper.getCountryCode(),
			currencyCode: 'EUR',
			supportedNetworks: ['visa', 'masterCard'],
			merchantCapabilities: ['supports3DS'],
			total: { label: 'Demo PayPlug', amount: cart.getTotalGrossPrice().getValue().toString() },
			applicationData: Encoding.toBase64(bytes)
		};

		res.setContentType('application/json');
    	res.print(JSON.stringify(payload));


		next();
	}
);

server.get('ValidateMerchant',
	function (req, res, next) {
		const paymentMethod = PaymentManager.getPaymentMethod('PAYPLUG_APPLE'); //TODO
		const PayPlugPayment = new PayPlugPaymentModel();
		const PaymentResponse = PayPlugPayment.createPayment(paymentMethod, null);

		res.json({
			merchant_session: PaymentResponse ? PaymentResponse.response.payment_method.merchant_session : null,
			paymentId: PaymentResponse ? PaymentResponse.getPaymentID() : null
		});
		next();
	}
)

server.post('UpdatePayment',
	function (req, res, next) {
		const PayPlugPayment = new PayPlugPaymentModel();
		const paymentID = req.querystring.paymentID;
		const aborted = req.querystring.aborted;
		if (aborted) {
			PayPlugPayment.cancelPayment(paymentID);
			res.json({});
			return next();
		}
		const paymentToken = JSON.parse(req.form.paymenttoken);
		const UpdateResponse = PayPlugPayment.updatePayment(paymentToken, paymentID);
		res.setContentType('application/json');
		res.print(JSON.stringify(UpdateResponse.response));
		next();
	}
)

module.exports = server.exports();