document.addEventListener('DOMContentLoaded', function () {
	oneyOpenSimulation();
	oneyCloseSimulation();
	oneyChangePayment();

	$('body').on('product:afterAttributeSelect', function (e) {
		updateSimulation($('.sales span').attr('content') * $('.quantity-select').val());
	});

	$('body').on('cart:update', function (e) {
		let price = $('.grand-total').text();
		let cleanPrice = price.replace(/[€\s]/g, '');

    	cleanPrice = cleanPrice.replace(/\./g, '').replace(',', '.');
		updateSimulation(parseFloat(cleanPrice));
	});
});

function updateSimulation(price) {
	var url = $('.oney-simulation').data('simulation-update') + '?price=' + price;
	$.ajax({
		url: url,
		type: 'get',
		context: this,
		dataType: 'html',
		async: false,
		success: function (data) {
			$('.oney-simulation').replaceWith(data);
			oneyOpenSimulation();
			oneyCloseSimulation();
			oneyChangePayment();
		}
	});
}

function oneyOpenSimulation() {
	const openPopin = document.getElementById('openPopin');
	if (openPopin) {
		openPopin.addEventListener("click", function () {
			document.getElementById("popin").classList.add("active");
		});
	}
}

function oneyCloseSimulation() {
	const closePopin = document.getElementById('closePopin');
	if (closePopin) {
		closePopin.addEventListener("click", function () {
			document.getElementById("popin").classList.remove("active");
		});
	}
}

function oneyChangePayment() {
	const paymentOptions = document.getElementById("payment-options");
	if (paymentOptions) {
		paymentOptions.addEventListener("change", function () {
			const selectedOption = this.value; // Récupère la valeur sélectionnée (3x ou 4x)

			document.querySelectorAll(".popin-body .payment-details").forEach(function (detail) {
				detail.style.display = "none";
			});

			// Affiche uniquement le bloc correspondant à l'option sélectionnée
			const activeDetails = document.getElementById(selectedOption);
			if (activeDetails) {
				activeDetails.style.display = "block";
			}
		});
		paymentOptions.dispatchEvent(new Event("change"));
	}
}