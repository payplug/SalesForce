const { event } = require("jquery");

async function onApplePayButtonClicked(url) {
	try {

		var paymentId;

		// Effectuer la requête pour récupérer les détails de la transaction
		const request = await $.ajax({
			url: url,
			dataType: 'json'
		});

		// Créer la session Apple Pay
		const session = new ApplePaySession(3, request);

		session.onvalidatemerchant = async (event) => {
			try {
				const merchantSession = await validateMerchant();
				paymentId = merchantSession.paymentId;
				session.completeMerchantValidation(merchantSession.merchant_session);
			} catch (err) {
				console.error("Erreur lors de la validation du marchand :", err);
			}
		};

		session.onpaymentauthorized = async (event) => {
			const paymentToken = event.payment.token;

			const res = await $.ajax({
				url: $('.onApplePayButtonClicked').data('pp-update') + '?paymentID=' + paymentId,
				type: 'POST',
				data: {
					paymenttoken: JSON.stringify(paymentToken)
				},
				dataType: 'json'
			});

			let apple_pay_Session_status = ApplePaySession.STATUS_SUCCESS;
			const data = await res;
			if (data.is_paid !== true) {
				apple_pay_Session_status = ApplePaySession.STATUS_FAILURE;
			}

			const result = {
				"status": apple_pay_Session_status
			};

			session.completePayment(result);
			window.location.href = $('.onApplePayButtonClicked').data('pp-applevalidationurl');
		};

		session.oncancel = async () => {
			await $.ajax({
				url: $('.onApplePayButtonClicked').data('pp-update') + '?paymentID=' + paymentId + '&aborted=true',
				type: 'POST',
				dataType: 'json'
			});
			console.error("Paiement annulé par l'utilisateur.");
		};

		// Commencer la session Apple Pay
		session.begin();
	} catch (error) {
		console.error("Erreur lors de la récupération des détails de la transaction :", error);
	}
}

async function validateMerchant() {
	try {
		const response = await $.ajax({
			url: $('.onApplePayButtonClicked').data('pp-validate'),
			contentType: 'application/json',
			method: 'GET',
		});

		return response;
	} catch (error) {
		console.error("Erreur lors de la validation du marchand :", error);
		throw error;
	}
}

document.addEventListener('DOMContentLoaded', function () {
	// Vérifiez si Apple Pay est disponible
	if (!window.ApplePaySession || !ApplePaySession.canMakePayments()) {
		$('li[data-pp-apple="true"]').hide();
		return;
	}
	$('.onApplePayButtonClicked').on('click', function (event) {
		event.preventDefault();
		onApplePayButtonClicked($(this).data('pp-applepay'));
	});
});