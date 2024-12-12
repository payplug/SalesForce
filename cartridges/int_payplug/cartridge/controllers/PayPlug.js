'use strict';

// API Includes
const URLUtils = require('dw/web/URLUtils');
const Resource = require('dw/web/Resource');
const HookMgr = require('dw/system/HookMgr');
const OrderMgr = require('dw/order/OrderMgr');
const BasketMgr = require('dw/order/BasketMgr');
const Transaction = require('dw/system/Transaction');
const PaymentManager = require('dw/order/PaymentMgr');

var server = require('server');
var cache = require('*/cartridge/scripts/middleware/cache');

const hooksHelper = require('*/cartridge/scripts/helpers/hooks');
const PayPlugUtils = require('~/cartridge/scripts/util/PayPlugUtils');
const orderHelpers = require('*/cartridge/scripts/order/orderHelpers');
const COHelpers = require('*/cartridge/scripts/checkout/checkoutHelpers');
const addressHelpers = require('*/cartridge/scripts/helpers/addressHelpers');
const PayPlugPaymentModel = require('~/cartridge/models/PayPlugPaymentModel');
const validationHelpers = require('*/cartridge/scripts/helpers/basketValidationHelpers');
const basketCalculationHelpers = require('*/cartridge/scripts/helpers/basketCalculationHelpers');



server.get('GetHPP', server.middleware.https, function (req, res, next) {
	const paymentMethod = PaymentManager.getPaymentMethod(BasketMgr.getCurrentBasket().getPaymentInstrument().getPaymentMethod());
	const PayPlugPayment = new PayPlugPaymentModel();
	const PaymentResponse = PayPlugPayment.createPayment(paymentMethod, server.forms.getForm('billing').payplugCreditCard.value);

	res.render('payplug/paymentSummary', {
		paymentMethodName: paymentMethod.getName(),
		paymentURL: PaymentResponse.getPaymentURL()
	});

	next();
});


server.get('GetForm', server.middleware.https, function (req, res, next) {
	const paymentMethod = PaymentManager.getPaymentMethod(req.querystring.paymentMethodID);
	const PayPlugPayment = new PayPlugPaymentModel();
	const PaymentResponse = PayPlugPayment.createPayment(paymentMethod, server.forms.getForm('billing').payplugCreditCard.value);

	res.json({
		payplug_url: PaymentResponse.getPaymentURL(),
		payplug_id: PaymentResponse.getPaymentID()
	})

	next();
});

/** For Hosted payment page */
server.get('CreateOrderHPP', server.middleware.https, function (req, res, next) {
	var currentBasket = BasketMgr.getCurrentBasket();
	if (!currentBasket) {
		res.json({
			error: true,
			cartError: true,
			fieldErrors: [],
			serverErrors: [],
			redirectUrl: URLUtils.url('Cart-Show').toString()
		});
		return next();
	}

	var validatedProducts = validationHelpers.validateProducts(currentBasket);
	if (validatedProducts.error) {
		res.json({
			error: true,
			cartError: true,
			fieldErrors: [],
			serverErrors: [],
			redirectUrl: URLUtils.url('Cart-Show').toString()
		});
		return next();
	}

	if (req.session.privacyCache.get('fraudDetectionStatus')) {
		res.json({
			error: true,
			cartError: true,
			redirectUrl: URLUtils.url('Error-ErrorCode', 'err', '01').toString(),
			errorMessage: Resource.msg('error.technical', 'checkout', null)
		});

		return next();
	}

	var validationOrderStatus = hooksHelper('app.validate.order', 'validateOrder', currentBasket, require('*/cartridge/scripts/hooks/validateOrder').validateOrder);
	if (validationOrderStatus.error) {
		res.json({
			error: true,
			errorMessage: validationOrderStatus.message
		});
		return next();
	}

	// Check to make sure there is a shipping address
	if (currentBasket.defaultShipment.shippingAddress === null) {
		res.json({
			error: true,
			errorStage: {
				stage: 'shipping',
				step: 'address'
			},
			errorMessage: Resource.msg('error.no.shipping.address', 'checkout', null)
		});
		return next();
	}

	// Check to make sure billing address exists
	if (!currentBasket.billingAddress) {
		res.json({
			error: true,
			errorStage: {
				stage: 'payment',
				step: 'billingAddress'
			},
			errorMessage: Resource.msg('error.no.billing.address', 'checkout', null)
		});
		return next();
	}

	// Calculate the basket
	Transaction.wrap(function () {
		basketCalculationHelpers.calculateTotals(currentBasket);
	});

	// Re-validates existing payment instruments
	var validPayment = COHelpers.validatePayment(req, currentBasket);
	if (validPayment.error) {
		res.json({
			error: true,
			errorStage: {
				stage: 'payment',
				step: 'paymentInstrument'
			},
			errorMessage: Resource.msg('error.payment.not.valid', 'checkout', null)
		});
		return next();
	}

	// Re-calculate the payments.
	var calculatedPaymentTransactionTotal = COHelpers.calculatePaymentTransaction(currentBasket);
	if (calculatedPaymentTransactionTotal.error) {
		res.json({
			error: true,
			errorMessage: Resource.msg('error.technical', 'checkout', null)
		});
		return next();
	}

	// Creates a new order.
	var order;
	Transaction.wrap(function () {
		order = OrderMgr.createOrder(currentBasket, currentBasket.getCustom()['payplugOrderNo']);
		currentBasket.getCustom()['payplugOrderNo'] = null;
	});

	if (!order) {
		res.json({
			error: true,
			errorMessage: Resource.msg('error.technical', 'checkout', null)
		});
		return next();
	}

	var fraudDetectionStatus = hooksHelper('app.fraud.detection', 'fraudDetection', currentBasket, require('*/cartridge/scripts/hooks/fraudDetection').fraudDetection);
	if (fraudDetectionStatus.status === 'fail') {
		Transaction.wrap(function () {
			OrderMgr.failOrder(order, true);
		});

		// fraud detection failed
		req.session.privacyCache.set('fraudDetectionStatus', true);

		res.json({
			error: true,
			cartError: true,
			redirectUrl: URLUtils.url('Error-ErrorCode', 'err', fraudDetectionStatus.errorCode).toString(),
			errorMessage: Resource.msg('error.technical', 'checkout', null)
		});

		return next();
	}

	if (req.currentCustomer.addressBook) {
		// save all used shipping addresses to address book of the logged in customer
		var allAddresses = addressHelpers.gatherShippingAddresses(order);
		allAddresses.forEach(function (address) {
			if (!addressHelpers.checkIfAddressStored(address, req.currentCustomer.addressBook.addresses)) {
				addressHelpers.saveAddress(address, req.currentCustomer, addressHelpers.generateAddressName(address));
			}
		});
	}

	// Reset usingMultiShip after successful Order placement
	req.session.privacyCache.set('usingMultiShipping', false);

	res.json({});
	next();
});

server.get('CancelURL', server.middleware.https, function (req, res, next) {
	const lastorder = orderHelpers.getLastOrder(req);
	const order = OrderMgr.getOrder(lastorder.orderNumber);
	Transaction.wrap(function () {
		order.addNote('Order Failed - PayPlug', 'Order failed');
		OrderMgr.failOrder(order, true);
	});

	res.redirect(URLUtils.url('Checkout-Begin', 'PayPlugError', true));
	return next();
});

server.get('ReturnURL', server.middleware.https, function (req, res, next) {
	// Places the order
	var currentBasket = BasketMgr.getCurrentBasket();
	var lastorder = orderHelpers.getLastOrder(req);
	const order = OrderMgr.getOrder(lastorder.orderNumber);

	var placeOrderResult = COHelpers.placeOrder(order, {
		status: true
	});
	if (placeOrderResult.error) {
		res.json({
			error: true,
			errorMessage: Resource.msg('error.technical', 'checkout', null)
		});
		return next();
	}
	// Handles payment authorization
	var handlePaymentResult = COHelpers.handlePayments(order, order.orderNo);

	// Handle custom processing post authorization
	var options = {
		req: req,
		res: res
	};
	var postAuthCustomizations = hooksHelper('app.post.auth', 'postAuthorization', handlePaymentResult, order, options, require('*/cartridge/scripts/hooks/postAuthorizationHandling').postAuthorization);
	if (postAuthCustomizations && Object.prototype.hasOwnProperty.call(postAuthCustomizations, 'error')) {
		res.json(postAuthCustomizations);
		return next();
	}

	if (handlePaymentResult.error) {
		res.json({
			error: true,
			errorMessage: Resource.msg('error.technical', 'checkout', null)
		});
		return next();
	}

	if (order.getCustomerEmail()) {
		COHelpers.sendConfirmationEmail(order, req.locale.id);
	}

	Transaction.wrap(() => order.getCustom()['isPayPlug'] = true);

	res.render('checkout/confirmation/formRedirect', {
		error: false,
		orderID: order.orderNo,
		orderToken: order.orderToken,
		continueUrl: URLUtils.url('Order-Confirm').toString()
	});

	next();
});

server.get('PlaceOrderLightbox', server.middleware.https, function (req, res, next) {
	var currentBasket = BasketMgr.getCurrentBasket();
	const paymentMethod = req.querystring.paymentMethodID;

	if (HookMgr.hasHook('app.payment.processor.payplug')) {
		HookMgr.callHook('app.payment.processor.payplug',
			'Handle',
			currentBasket,
			null,
			paymentMethod,
			req
		);
	} else {
		HookMgr.callHook('app.payment.processor.default', 'Handle');
	}

	if (!currentBasket) {
		res.json({
			error: true,
			cartError: true,
			fieldErrors: [],
			serverErrors: [],
			redirectUrl: URLUtils.url('Cart-Show').toString()
		});
		return next();
	}

	var validatedProducts = validationHelpers.validateProducts(currentBasket);
	if (validatedProducts.error) {
		res.json({
			error: true,
			cartError: true,
			fieldErrors: [],
			serverErrors: [],
			redirectUrl: URLUtils.url('Cart-Show').toString()
		});
		return next();
	}

	if (req.session.privacyCache.get('fraudDetectionStatus')) {
		res.json({
			error: true,
			cartError: true,
			redirectUrl: URLUtils.url('Error-ErrorCode', 'err', '01').toString(),
			errorMessage: Resource.msg('error.technical', 'checkout', null)
		});

		return next();
	}

	var validationOrderStatus = hooksHelper('app.validate.order', 'validateOrder', currentBasket, require('*/cartridge/scripts/hooks/validateOrder').validateOrder);
	if (validationOrderStatus.error) {
		res.json({
			error: true,
			errorMessage: validationOrderStatus.message
		});
		return next();
	}

	// Check to make sure there is a shipping address
	if (currentBasket.defaultShipment.shippingAddress === null) {
		res.json({
			error: true,
			errorStage: {
				stage: 'shipping',
				step: 'address'
			},
			errorMessage: Resource.msg('error.no.shipping.address', 'checkout', null)
		});
		return next();
	}

	// Check to make sure billing address exists
	if (!currentBasket.billingAddress) {
		res.json({
			error: true,
			errorStage: {
				stage: 'payment',
				step: 'billingAddress'
			},
			errorMessage: Resource.msg('error.no.billing.address', 'checkout', null)
		});
		return next();
	}

	// Calculate the basket
	Transaction.wrap(function () {
		basketCalculationHelpers.calculateTotals(currentBasket);
	});

	// Re-validates existing payment instruments
	var validPayment = COHelpers.validatePayment(req, currentBasket);
	if (validPayment.error) {
		res.json({
			error: true,
			errorStage: {
				stage: 'payment',
				step: 'paymentInstrument'
			},
			errorMessage: Resource.msg('error.payment.not.valid', 'checkout', null)
		});
		return next();
	}

	// Re-calculate the payments.
	var calculatedPaymentTransactionTotal = COHelpers.calculatePaymentTransaction(currentBasket);
	if (calculatedPaymentTransactionTotal.error) {
		res.json({
			error: true,
			errorMessage: Resource.msg('error.technical', 'checkout', null)
		});
		return next();
	}

	// Creates a new order.
	var order;
	Transaction.wrap(function () {
		order = OrderMgr.createOrder(currentBasket, currentBasket.getCustom()['payplugOrderNo']);
		currentBasket.getCustom()['payplugOrderNo'] = null;
	});

	if (!order) {
		res.json({
			error: true,
			errorMessage: Resource.msg('error.technical', 'checkout', null)
		});
		return next();
	}

	// Handles payment authorization
	var handlePaymentResult = COHelpers.handlePayments(order, order.orderNo);

	// Handle custom processing post authorization
	var options = {
		req: req,
		res: res
	};
	var postAuthCustomizations = hooksHelper('app.post.auth', 'postAuthorization', handlePaymentResult, order, options, require('*/cartridge/scripts/hooks/postAuthorizationHandling').postAuthorization);
	if (postAuthCustomizations && Object.prototype.hasOwnProperty.call(postAuthCustomizations, 'error')) {
		res.json(postAuthCustomizations);
		return next();
	}

	if (handlePaymentResult.error) {
		res.json({
			error: true,
			errorMessage: Resource.msg('error.technical', 'checkout', null)
		});
		return next();
	}

	var fraudDetectionStatus = hooksHelper('app.fraud.detection', 'fraudDetection', currentBasket, require('*/cartridge/scripts/hooks/fraudDetection').fraudDetection);
	if (fraudDetectionStatus.status === 'fail') {
		Transaction.wrap(function () {
			OrderMgr.failOrder(order, true);
		});

		// fraud detection failed
		req.session.privacyCache.set('fraudDetectionStatus', true);

		res.json({
			error: true,
			cartError: true,
			redirectUrl: URLUtils.url('Error-ErrorCode', 'err', fraudDetectionStatus.errorCode).toString(),
			errorMessage: Resource.msg('error.technical', 'checkout', null)
		});

		return next();
	}

	// Places the order
	var placeOrderResult = COHelpers.placeOrder(order, fraudDetectionStatus);
	if (placeOrderResult.error) {
		res.json({
			error: true,
			errorMessage: Resource.msg('error.technical', 'checkout', null)
		});
		return next();
	}

	if (req.currentCustomer.addressBook) {
		// save all used shipping addresses to address book of the logged in customer
		var allAddresses = addressHelpers.gatherShippingAddresses(order);
		allAddresses.forEach(function (address) {
			if (!addressHelpers.checkIfAddressStored(address, req.currentCustomer.addressBook.addresses)) {
				addressHelpers.saveAddress(address, req.currentCustomer, addressHelpers.generateAddressName(address));
			}
		});
	}

	if (order.getCustomerEmail()) {
		COHelpers.sendConfirmationEmail(order, req.locale.id);
	}

	// Reset usingMultiShip after successful Order placement
	req.session.privacyCache.set('usingMultiShipping', false);

	Transaction.wrap(() => order.getCustom()['isPayPlug'] = true);

	res.render('checkout/confirmation/formRedirect', {
		error: false,
		orderID: order.orderNo,
		orderToken: order.orderToken,
		continueUrl: URLUtils.url('Order-Confirm').toString()
	});

	next();
});

server.post('Notification', server.middleware.https, function (req, res, next) {
	PayPlugUtils.createNotificationCustomObject(JSON.parse(request.getHttpParameterMap().getRequestBodyAsString()));
	res.setStatusCode(201);
	res.json({
		error: false,
		message: ''
	});
	next();
});

server.get('OneySimuation', server.middleware.https, function (req, res, next) {
	const PayPlug = new PayPlugPaymentModel();
	const simu = PayPlug.oneySimulation(200000);
	res.render('payplug/oneySimuation', {
		simu: simu
	});

	next();
});

module.exports = server.exports();