'use strict';

//API Include
const Transaction = require('dw/system/Transaction');

function Handle(basket, paymentInformation, paymentMethodID) {
	Transaction.wrap(function () {
		basket.removeAllPaymentInstruments();
		basket.createPaymentInstrument(paymentMethodID, basket.totalGrossPrice);
	});

	return {
		error: false
	};
}

function Authorize(orderNumber, paymentInstrument, paymentProcessor) {
	var serverErrors = [];
	var fieldErrors = {};
	var error = false;

	try {
		Transaction.wrap(function () {
			paymentInstrument.paymentTransaction.setTransactionID(orderNumber);
			paymentInstrument.paymentTransaction.setPaymentProcessor(paymentProcessor);
		});
	} catch (e) {
		error = true;
		serverErrors.push(
			Resource.msg('error.technical', 'checkout', null)
		);
	}

	return { fieldErrors: fieldErrors, serverErrors: serverErrors, error: error };
}

exports.Handle = Handle;
exports.Authorize = Authorize;
