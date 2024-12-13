document.addEventListener('DOMContentLoaded', function () {
	document.getElementById("openPopin").addEventListener("click", function () {
		document.getElementById("popin").classList.add("active");
	});

	document.getElementById("closePopin").addEventListener("click", function () {
		document.getElementById("popin").classList.remove("active");
	});

	document.getElementById("payment-options").addEventListener("change", function () {
		const selectedOption = this.value; // Récupère la valeur sélectionnée (3x ou 4x)

		// Masque tous les blocs de détails de paiement
		document.querySelectorAll(".payment-details").forEach(function (detail) {
			detail.style.display = "none";
		});

		// Affiche uniquement le bloc correspondant à l'option sélectionnée
		const activeDetails = document.getElementById(selectedOption);
		if (activeDetails) {
			activeDetails.style.display = "block";
		}
	});

	// Initialisation - affiche le bon bloc au chargement
	document.getElementById("payment-options").dispatchEvent(new Event("change"));

});