'use strict';

function PayPlugApiProvider() { }

PayPlugApiProvider.APIAvailables = {
	"PayPlug": require('*/cartridge/services/api/PayPlugPaymentAPI'),
};

PayPlugApiProvider.get = function get(APIName, args) {
	if (!(APIName in PayPlugApiProvider.APIAvailables)) {
		throw new Error("Unsupported PayPlug API : " + APIName);
	}

	return new (PayPlugApiProvider.APIAvailables[APIName])(args);
}

module.exports = PayPlugApiProvider;
