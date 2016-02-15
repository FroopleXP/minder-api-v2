// waiting for page to load
$(document).ready(function() {
	// Configuring the form ready for submission
	var reg_form = $('#register');
	// Listening for submission
	reg_form.on('submit', function() {
		// Getting the form data
		var reg_data = form_parse(reg_form);
		// Sending the data to the server
		$.ajax({
			method: 'POST',
			url: '/register',
			dataType: 'JSON',
			timeout: 10000,
			data: {
				form_data: reg_data
			},
			success: function(data) {
				console.log(data);
			}, 
			error: function(err) {
				console.log(err);
			}
		});
		// Stopping the form from submittin
		return false;
	});
});

// Function for parsing the form data
function form_parse(form) {
	// Serializing the data
	var book_form_data = form.serializeArray(),
		data_obj = {};
	// Pushing the data to an array
	for (var i = 0, l = book_form_data.length; i < l; i++) {
	    data_obj[book_form_data[i].name] = book_form_data[i].value;
	}
	// Returning the object
	return data_obj;
}