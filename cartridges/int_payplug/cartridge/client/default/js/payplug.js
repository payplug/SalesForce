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
				success: function (data) {
					var payplug_url = JSON.parse(data).payplug_url;

					if (typeof Payplug !== 'undefined' && Payplug.showPayment) {
						Payplug.showPayment(payplug_url);
					} else {
						console.error('Payplug.showPayment is not defined');
					}
				}
			});
        });
    });
});