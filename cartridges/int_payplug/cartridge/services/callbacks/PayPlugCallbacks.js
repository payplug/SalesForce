'use strict';

const Site = require('dw/system/Site');
const System = require('dw/system/System');
const StringUtils = require('dw/util/StringUtils');

const PayPlugUtils = require('~/cartridge/scripts/util/PayPlugUtils');

const payplugVersion = '2019-08-06';

function PayPlugCallBacks() { }

PayPlugCallBacks.postCallback = function _postCallback() {
	return {
		createRequest: function (svc, params) {
			svc.setRequestMethod("POST");
			svc.addHeader('Authorization', 'Bearer ' + Site.getCurrent().getCustomPreferenceValue('PP_secretKey'));
			svc.addHeader('Content-Type', 'application/json');
			svc.addHeader('PayPlug-Version', payplugVersion);
			svc.setURL(svc.getURL() + params.endpoint);

			var body = JSON.stringify(params.body);
			return body;
		},
		parseResponse: this.parseResponse
	};
}

PayPlugCallBacks.patchCallback = function _patchCallback() {
	return {
		createRequest: function (svc, params) {
			svc.setRequestMethod("PATCH");
			svc.addHeader('Authorization', 'Bearer ' + Site.getCurrent().getCustomPreferenceValue('PP_secretKey'));
			svc.addHeader('Content-Type', 'application/json');
			svc.addHeader('PayPlug-Version', payplugVersion);
			svc.setURL(svc.getURL() + params.endpoint);

			var body = JSON.stringify(params.body);
			return body;
		},
		parseResponse: this.parseResponse
	};
}

PayPlugCallBacks.getCallback = function _getCallback() {
	return {
		createRequest: function (svc, params) {
			svc.setRequestMethod("GET");
			svc.addHeader('Authorization', 'Bearer ' + Site.getCurrent().getCustomPreferenceValue('PP_secretKey'));
			svc.addHeader('PayPlug-Version', payplugVersion);
			svc.setURL(svc.getURL() + params.endpoint);
		},
		parseResponse: this.parseResponse
	};
}

PayPlugCallBacks.deleteCallback = function _deleteCallback() {
	return {
		createRequest: function (svc, params) {
			svc.setRequestMethod("DELETE");
			svc.addHeader('Authorization', 'Bearer ' + Site.getCurrent().getCustomPreferenceValue('PP_secretKey'));
			svc.addHeader('PayPlug-Version', payplugVersion);
			svc.setURL(svc.getURL() + params.endpoint);
		},
		parseResponse: this.parseResponse
	};
}

PayPlugCallBacks.parseResponse = function parseResponse(svc, svcResponse) {
	try {
		return JSON.parse(svcResponse.getText());
	} catch (error) {
		return false;
	}
}

module.exports = PayPlugCallBacks;
