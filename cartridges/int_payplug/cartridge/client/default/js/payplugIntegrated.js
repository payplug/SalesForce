document.addEventListener('DOMContentLoaded', function () {

	const integratedPayment = new Payplug.IntegratedPayment();
	if (!$('.payplugIntegrated').data('pp-is-live')) {
		integratedPayment.secureDomain = "https://secure-qa.payplug.com";
	}

	const props = {
		inputStyles: {
			default: {
				color: '#2B343D',
				fontFamily: 'Poppins, sans-serif',
				fontSize: '14px',
				textAlign: 'left',
				'::placeholder': {
					color: '#969a9f',
				},
				':focus': {
					color: '#2B343D',
				}
			}
		}
	}

	// Add scheme
	const schemeElement = document.getElementById('scheme');
	const schemes = integratedPayment.getSupportedSchemes();
	schemes.forEach((scheme, id) => {
		const radio = document.createElement('input');
		radio.type = 'radio';
		radio.name = 'scheme';
		radio.id = scheme.name;
		radio.value = scheme.id;
		if (scheme.id === 0)
			radio.checked = true;
		schemeElement.appendChild(radio);

		//Add logo scheme or text
		const elmt = document.createElement('img');
		elmt.src = scheme.iconUrl;
		elmt.style.width = '26px';
		elmt.style.height = '21px';
		elmt.title = scheme.name;
		elmt.alt = scheme.name;
		schemeElement.appendChild(elmt);
	});

	// Add card holder field
	integratedPayment.cardHolder(document.getElementById('cardholder-input-container'), {
		default: props.inputStyles.default
	});

	// Add each payments fields
	integratedPayment.cardNumber(document.getElementById('pan-input-container'), {
		default: props.inputStyles.default
	});
	integratedPayment.cvv(document.getElementById('cvv-input-container'), {
		default: props.inputStyles.default
	});
	integratedPayment.expiration(document.getElementById('exp-input-container'), {
		default: props.inputStyles.default
	});

	// Handle your form submission
	[].forEach.call(document.querySelectorAll("#payplugIntegratedPayment"), function (el) {
		el.addEventListener('click', function (event) {
			// Cancel default form submission
			event.preventDefault();
			event.stopPropagation();

			integratedPayment.validateForm();
		});
	});

	// Listen to the validateForm Event
	integratedPayment.onValidateForm(({ isFormValid }) => {
		// Form is valid, you can proceed with transaction
		if (isFormValid) {
			// Create payment object on your back-end
			createPaymentOnBackEnd((payplug_id) => {
				integratedPayment.pay(payplug_id, 0, { save_card: $('input[name="pp-integrated-savecard"]').is(':checked') });
			});
		}
	});

	// Implement your own retrieve function from back end
	integratedPayment.onCompleted((event) => {
		if (event.error) {
			console.error(event);
		} else {
			window.location.href = $('#payplugIntegratedPayment').data('pp-validationurl');
		}
	});
});

function createPaymentOnBackEnd(callback) {
	const payplugUrl = $('#payplugIntegratedPayment').data('pp-url');

	if (!payplugUrl) {
		console.error("Payplug URL not found");
		return;
	}

	$.ajax({
		url: payplugUrl,
		type: 'get',
		dataType: 'html',
		async: true,
		success: function (data) {
			const payplug_id = JSON.parse(data).payplug_id;

			// Appeler le callback une fois que le payplug_id est récupéré
			if (callback && typeof callback === 'function') {
				callback(payplug_id);
			}
		},
		error: function (error) {
			console.error("Failed to create payment on backend:", error);
		}
	});
}