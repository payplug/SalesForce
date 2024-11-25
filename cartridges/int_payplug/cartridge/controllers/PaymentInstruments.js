'use strict';

const server = require('server');
const OrderMgr = require('dw/order/OrderMgr');

const array = require('*/cartridge/scripts/util/array');
const PayPlugPaymentModel = require('~/cartridge/models/PayPlugPaymentModel');

server.extend(module.superModule);

server.append('DeletePayment',
    function (req, res, next) {
    	const UUID = req.querystring.UUID;
		const paymentInstruments = req.currentCustomer.wallet.paymentInstruments;
		const paymentToDelete = array.find(paymentInstruments, function (item) {
			return UUID === item.UUID && item.raw.getCreditCardToken().includes('card_');
		});
		if (paymentToDelete) {
			const PayPlugPayment = new PayPlugPaymentModel();
			PayPlugPayment.removeCustomerCardFromWallet(paymentToDelete.raw.getCreditCardToken());
		}


        next();
    }
);

module.exports = server.exports();