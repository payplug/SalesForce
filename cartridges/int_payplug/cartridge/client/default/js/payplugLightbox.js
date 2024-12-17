function loadAndEncapsulateScript(url) {
	return new Promise(function (resolve, reject) {
		var script = document.createElement('script');
		script.src = url;
		script.type = 'text/javascript';
		script.async = true;

		script.onload = function () {
			resolve();
		};

		script.onerror = function () {
			reject(new Error(`Erreur lors du chargement du script : ${url}`));
		};

		document.head.appendChild(script);
	});
}

document.addEventListener('DOMContentLoaded', function () {
	[].forEach.call(document.querySelectorAll(".payplugLightbox"), function (el) {
		el.addEventListener('click', function (event) {
			event.preventDefault();
			$.ajax({
				url: el.getAttribute('data-pp-lightbox-url'),
				type: 'get',
				context: this,
				dataType: 'html',
				async: true,
				success: async function (data) {
					try {
						var payplug_url = JSON.parse(data).payplug_url;

						await loadAndEncapsulateScript(el.getAttribute('data-pp-lightbox-lib'));
						if (typeof Payplug !== 'undefined' && Payplug.showPayment) {
							Payplug.showPayment(payplug_url);
						} else {
							console.error('Payplug.showPayment is not defined');
						}
					} catch (error) {
						console.error('Erreur dans le traitement du script Payplug:', error);
					}
				},
				error: function (data) {
					el.insertAdjacentText('afterend', JSON.parse(data.responseText).message);
				}
			});
		});
	});
});
