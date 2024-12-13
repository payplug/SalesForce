
(function ($) {
	/**
	 * Load Handlers
	 */
	function loadEventHandlers() {
		$('#applyLocale').click(function (e) {
			e.preventDefault();
			var newLocale = $('select[name$="dalAccount_dalLocale"').val();
			location.href = e.target.href + '&locale=' + newLocale;
		});

		$('#importXML').click(function () {
			$('#result').children('#description').removeClass().addClass('bg-warning')
				.html(window.Resources.importingXML);
			$.ajax({
				url: window.Urls.importXML
			})
				.done(function (response) {
					displayResponse(response);
				});
		});

		$('input[name$="dalActions_dalOrderRefundAmount"]').on('input', function () {
			$('#js-refund').prop('disabled', $(this).val() < 0);
		});

		$('.bm-close').on('click', function () {
			$('.bm-refund-block').fadeOut();
			var newHref = location.href.split('&responseMessage')[0];
			window.location.href = newHref;
		});
	}

	$(document).ready(function () {
		loadEventHandlers();
	});
})(jQuery);