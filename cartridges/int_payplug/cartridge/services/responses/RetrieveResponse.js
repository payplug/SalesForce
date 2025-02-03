'use strict';

function RetrieveResponse(response) {
	this.response = response;
	this.failure = this._setFailure();
}

RetrieveResponse.prototype._setFailure = function _setFailure() {
	return this.response.failure;
}

RetrieveResponse.prototype.getFailure = function getFailure() {
	return this.failure;
}



module.exports = RetrieveResponse;