'use strict';

/* API Includes */
const Logger = require('dw/system/Logger');
const Result = require('dw/svc/Result');

function ServiceModel(serviceName, serviceCallbacks) {
    this.serviceName = serviceName;
    this.callbacks = serviceCallbacks;
    this._createService();
    this.logger = Logger.getLogger("ServiceModel", "service");
}

ServiceModel.prototype._createService = function _createService() {
    const LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');

    this.service = LocalServiceRegistry.createService(this.serviceName, this.callbacks);

    if (this.service == null) {
        this.logger.error("Service " + this.serviceName + " does not exist");
        return;
    }
}

ServiceModel.prototype._call = function _call(request) {
    this.logger.debug(JSON.stringify(request));

    return this.service.call(request);
}

ServiceModel.prototype.logFailure = function logFailure(result, request) {
    const logEntry = {
        status: result.status,
        error: result.error,
        errorMessage: result.errorMessage || undefined,
        msg: result.msg || undefined,
        request: request || undefined
    };

    this.logger.error("Service failure :" + JSON.stringify(logEntry, null, 2));
}

ServiceModel.prototype.executeCall = function executeCall(request, OverlayResponse) {

    const result = this._call(request);

    if (result.isOk() === false || result.getStatus().equals(Result.ERROR) || empty(result.object)) {
        this.logFailure(result, request);
        return false;
    }

    if (OverlayResponse) {
        return new OverlayResponse(result.getObject());
    } else {
        return result.getObject();
    }
}

ServiceModel.prototype.setLogger = function setLogger(logger) {
    this.logger = logger;
}

module.exports = ServiceModel;
