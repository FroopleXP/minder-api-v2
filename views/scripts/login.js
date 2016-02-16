// waiting for page to load
$(document).ready(function() {
	// Configuring the form ready for submission
	var login_form = $('#login');
	// Listening for submission
	login_form.on('submit', function() {
		// Getting the form data
		var login_data = form_parse(login_form),
			login_btn = $("#login_btn");

		// Disabling the button
		login_btn.attr('disabled', true);
		login_btn.text("Logging in...");

		// Sending the data to the server
		$.ajax({
			method: 'POST',
			url: '/login',
			dataType: 'JSON',
			timeout: 10000,
			data: {
				form_data: login_data
			},
			success: function(data) {
				// Parsing the response
				// var res = JSON.parse(data);
				// Checking the data
				switch (data['stat']) {
					case 0:
						show_noti(0, data['message']);
						// Resetting the Button
						login_btn.attr('disabled', false);
						login_btn.text("Login");
						break;
					case 1:
						login_form.trigger("reset");
						show_noti(1, data['message']);
						login_btn.attr('disabled', false);
						login_btn.text("Login");
						break;
				}
			}, 
			error: function(err) {
				// Resetting the Button
				login_btn.attr('disabled', false);
				login_btn.text("Login");
				// Notifying that there has been an error
				show_noti(0, "<strong>Oops!</strong> Something went wrong. Please try again later...");
				console.log(err);
			}
		});
		// Stopping the form from submittin
		return false;
	});
});

// Function for showing any error messages
function show_noti(stat, msg) {
	// Declaring the ID of the notification box
	var noti_box = $("#show_noti");
	// Checking the status
	switch (stat) {
		case 0:
			noti_box.removeClass("alert-success");
			noti_box.addClass("alert-danger");
			break;
		case 1:
			noti_box.removeClass("alert-danger");
			noti_box.addClass("alert-success");
			break;
		default: 
			noti_box.hide();	
	}
	// Setting the text
	noti_box.html(msg);
}

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