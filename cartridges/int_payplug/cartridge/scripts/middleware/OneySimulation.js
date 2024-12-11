'use strict';

const PayPlugPaymentModel = require('~/cartridge/models/PayPlugPaymentModel');

function OneySimulationHelper() {}

OneySimulationHelper.applySimulationInViewData = function applySimulationInViewData(req, res, next) {
    const viewData = res.getViewData();

    const BasketMgr = require('dw/order/BasketMgr');

    var currentBasket = BasketMgr.getCurrentBasket();

    if (currentBasket) {
        const cartTotal = parseFloat(currentBasket.totalGrossPrice * 100);
		const PayPlug = new PayPlugPaymentModel();
        viewData.oneySimulation = PayPlug.oneySimulation(cartTotal).response;

        res.setViewData(viewData);
    }

    next();
}

OneySimulationHelper.applySimulationInViewDataProduct = function applySimulationInViewDataProduct(req, res, next) {
	var viewData = res.getViewData();

    const productPrice = viewData.product.price.sales ? viewData.product.price.sales.value : viewData.product.price.min.sales.value;
    const PayPlug = new PayPlugPaymentModel();
	viewData.oneySimulation = PayPlug.oneySimulation(parseFloat(productPrice * 100)).response;


    res.setViewData(viewData);
    next();
}

module.exports = OneySimulationHelper;