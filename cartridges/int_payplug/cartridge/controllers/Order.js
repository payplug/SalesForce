'use strict';

const server = require('server');
const OrderMgr = require('dw/order/OrderMgr');

server.extend(module.superModule);

server.append('Details',
    function (req, res, next) {
        this.on("route:BeforeComplete", function (req, res) {
            const viewData = res.getViewData();
            const order = OrderMgr.getOrder(req.querystring.orderID);
            viewData.orderHistoryDetails = order;

            res.setViewData(viewData);
        });

        next();
    }
);

server.append('Confirm',
    function (req, res, next) {
        this.on("route:BeforeComplete", function (req, res) {
            const viewData = res.getViewData();
            const order = OrderMgr.getOrder(viewData.order.orderNumber);
            viewData.orderConfirmDetails = order;

            res.setViewData(viewData);
        });

        next();
    }
);

module.exports = server.exports();
