"use strict";

var server = require('server');
var Site = require('dw/system/Site');
var URLRedirectMgr = require('dw/web/URLRedirectMgr');

server.extend(module.superModule);

server.prepend('Start', function (req, res, next) {
	var origin = URLRedirectMgr.redirectOrigin;
	if (origin.match('/.well-known/apple-developer-merchantid-domain-association')) {
		response.getWriter().print(Site.getCurrent().getCustomPreferenceValue('PP_ApplePayDomainCertificate'));
		return null;
	}
	return next();
});
module.exports = server.exports();