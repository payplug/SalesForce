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
        viewData.oneySimulation = PayPlug.oneySimulation(cartTotal);

        res.setViewData(viewData);
    }

    next();
}

module.exports = OneySimulationHelper;