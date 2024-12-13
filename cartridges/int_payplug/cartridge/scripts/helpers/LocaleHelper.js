'use strict'

const Locale = require('dw/util/Locale');

function LocaleHelper() {}

LocaleHelper.getCountryCode = function getCountryCode() {
    const locale = Locale.getLocale(request.getLocale());
    return locale.getCountry();
}

module.exports = LocaleHelper;