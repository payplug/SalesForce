'use strict';
var Resource = require('dw/web/Resource');


/**
 * default hook if no payment form processor is supported
 * @return {Object} an object that contains error information
 */
function processForm(req, paymentForm, viewFormData) {
    var viewData = viewFormData;
    viewData.paymentMethod = {
        value: paymentForm.paymentMethod.value,
        htmlName: paymentForm.paymentMethod.value
    };
    return {
        error: false,
        viewData: viewData
    };
}

/**
 * default hook if no save payment information processor is supported
 */
function savePaymentInformation() {
    return;
}

exports.processForm = processForm;
exports.savePaymentInformation = savePaymentInformation;
