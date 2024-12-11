document.addEventListener('DOMContentLoaded', function () {
	const paymentTypeSelector = document.getElementById('paymentType');
	const paymentOptions = document.querySelectorAll('.payment-option');

	paymentTypeSelector.addEventListener('change', function () {
		const selectedType = paymentTypeSelector.value;

		paymentOptions.forEach(option => {
			if (option.dataset.type === selectedType) {
				option.style.display = 'block';
			} else {
				option.style.display = 'none';
			}
		});
	});
});