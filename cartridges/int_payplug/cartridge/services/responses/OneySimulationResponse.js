'use strict';

var Money = require('dw/value/Money');

function OneySimulationResponse(response) {
	this.response = response;
	this.simulation = this._setSimulation();
}

OneySimulationResponse.prototype._setSimulation = function _setSimulation() {
	const getSelectedResponse = (withFees, withFeesResponse, withoutFeesResponse) =>
		withFees ? withFeesResponse : withoutFeesResponse;

	const createSimulationObject = (response, currency) => {
		if (!response) {
			return null; // Retourner null si aucune réponse n'est disponible
		}

		// Calcul du total
		const downPayment = response.down_payment_amount / 100;
		const firstPayment = response.installments[0].amount / 100;
		const secondPayment = response.installments[1] ? response.installments[1].amount / 100 : 0;
		const thirdPayment = response.installments[2] ? response.installments[2].amount / 100 : 0;
		const fees = response.total_cost / 100;

		const total = downPayment + firstPayment + secondPayment + thirdPayment;

		return {
			downPayment: new Money(downPayment, currency),
			firstPayment: new Money(firstPayment, currency),
			secondPayment: secondPayment > 0 ? new Money(secondPayment, currency) : null,
			thirdPayment: thirdPayment > 0 ? new Money(thirdPayment, currency) : null,
			fees: new Money(fees, currency),
			total: new Money(total, currency),
			taeg: response.nominal_annual_percentage_rate
		};
	};

	const currency = session.getCurrency().getCurrencyCode();

	// Vérifier si les réponses pour x3 sont disponibles
	const x3WithFees = !empty(this.response.x3_with_fees);
	const x3WithoutFees = !empty(this.response.x3_without_fees);
	const selectedResponseX3 = x3WithFees || x3WithoutFees
		? getSelectedResponse(x3WithFees, this.response.x3_with_fees, this.response.x3_without_fees)
		: null;

	// Vérifier si les réponses pour x4 sont disponibles
	const x4WithFees = !empty(this.response.x4_with_fees);
	const x4WithoutFees = !empty(this.response.x4_without_fees);
	const selectedResponseX4 = x4WithFees || x4WithoutFees
		? getSelectedResponse(x4WithFees, this.response.x4_with_fees, this.response.x4_without_fees)
		: null;

	return {
		x3: createSimulationObject(selectedResponseX3, currency),
		x4: createSimulationObject(selectedResponseX4, currency)
	};
};


OneySimulationResponse.prototype.getSimulation = function getSimulation() {
	return this.simulation;
}


module.exports = OneySimulationResponse;