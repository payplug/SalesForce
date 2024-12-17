'use strict';

const Site = require('dw/system/Site');
const Money = require('dw/value/Money');

const PayPlugPaymentModel = require('~/cartridge/models/PayPlugPaymentModel');

function OneySimulationHelper() { }

OneySimulationHelper.applySimulationInViewData = function applySimulationInViewData(req, res, next) {
	if (!Site.getCurrent().getCustomPreferenceValue('PP_oneyDisplay').some(item => item.value === 'Cart')) {
		next()
		return;
	}
	const viewData = res.getViewData();

	const BasketMgr = require('dw/order/BasketMgr');

	var currentBasket = BasketMgr.getCurrentBasket();

	if (currentBasket) {
		const cartTotal = currentBasket.totalGrossPrice;
		const PayPlug = new PayPlugPaymentModel();
		viewData.oneySimulationAmount = new Money(cartTotal.getValue(), cartTotal.getCurrencyCode());
		const oneySimulation = PayPlug.oneySimulation(parseFloat(cartTotal.value * 100))
		viewData.oneySimulation = oneySimulation ? oneySimulation.getSimulation() : [];

		res.setViewData(viewData);
	}

	next();
}

OneySimulationHelper.applySimulationInViewDataCheckout = function applySimulationInViewDataCheckout(req, res, next) {
	if (!Site.getCurrent().getCustomPreferenceValue('PP_oneyDisplay').some(item => item.value === 'Checkout')) {
		next()
		return;
	}
	const viewData = res.getViewData();

	const BasketMgr = require('dw/order/BasketMgr');

	var currentBasket = BasketMgr.getCurrentBasket();

	if (currentBasket) {
		const cartTotal = currentBasket.totalGrossPrice;
		const PayPlug = new PayPlugPaymentModel();
		viewData.oneySimulationAmount = new Money(cartTotal.getValue(), cartTotal.getCurrencyCode());
		const oneySimulation = PayPlug.oneySimulation(parseFloat(cartTotal.value * 100))
		viewData.oneySimulation = oneySimulation ? oneySimulation.getSimulation() : [];

		res.setViewData(viewData);
	}

	next();
}

OneySimulationHelper.applySimulationInViewDataProduct = function applySimulationInViewDataProduct(req, res, next) {
	if (!Site.getCurrent().getCustomPreferenceValue('PP_oneyDisplay').some(item => item.value === 'PDP')) {
		next()
		return;
	}
	var viewData = res.getViewData();

	const productPrice = viewData.product.price.sales ? viewData.product.price.sales : viewData.product.price.min.sales;
	const PayPlug = new PayPlugPaymentModel();
	viewData.oneySimulationAmount = new Money(productPrice.value, productPrice.currency);
	const oneySimulation = PayPlug.oneySimulation(parseFloat(productPrice.value * 100))
	viewData.oneySimulation = oneySimulation ? oneySimulation.getSimulation() : [];


	res.setViewData(viewData);
	next();
}

module.exports = OneySimulationHelper;