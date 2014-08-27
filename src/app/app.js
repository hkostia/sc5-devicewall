var app = require('./app.js'),
    $ = require('jquery'),
    user;





function start() {
	// Start the app here
	select();
	$(window).on("pageshow", function() {
    if (user) {
      $('#wait').hide();
      $('#content').addClass('devices');
      $('#container').removeClass('centerized');
      $('#devices').show();
    }
  });
}





function initializeUser(cb) {
	$.getJSON('/user', function(res) {
		if (res.user) {
			user = res.user;
			cb();
		} else {
			login();
		}
	});
}





function login() {

	$('#login').show();
	$('#login-button').click(function() {
		location = '/auth/google';
	});

}

function selectAll() {
  $('input[name="labels[]"]').not(':disabled').prop('checked', true);
}

function selectNone() {
  $('input[name="labels[]"]').not(':disabled').removeAttr('checked');
}



function select() {

	if (!user) {
		initializeUser(select);
		return;
	}

	$('#content').addClass('pc devices');

	$('#devices-form').submit(selectSubmit);

	$('#address').focus(function(event) {
		if (!event.target.value) {
			event.target.value = 'http://www.';
		}
	});

	setTimeout(function() {
		$('#devices').show();
		$('#container').removeClass('centerized');
	}, 300);

	var address = localStorage.getItem('address');

	if (address) {
		$('#address').val(address);
	}

  $('#select-all').click(selectAll);
  $('#select-none').click(selectNone);

  $('#stop-testing').click(stopTesting);

	var devicesList = $('#devices-list');
	$.getJSON('/devices', function(data) {

		$.each(data, function(key, value) {

    		var rowElement = $('<tr class="device" data-label="' + value.label + '"></tr>');

			rowElement.append(
				'<td>' + value.label + '</td>' +
				'<td contenteditable data-key="name" title="Edit">' + (value.name || '') + '</td>' +
				'<td contenteditable data-key="model" title="Edit">' + (value.model || '') + '</td>' +
				'<td contenteditable data-key="os" title="Edit">' + (value.os || '') + '</td>' +
				'<td contenteditable data-key="serial" title="Edit">' + (value.serial || '') + '</td>' +
				'<td contenteditable data-key="imei" title="Edit">' + (value.imei || '') + '</td>' +
				'<td contenteditable data-key="location" title="Edit">' + (value.location || '') + '</td>' +
				'<td contenteditable data-key="owner" title="Edit">' + (value.owner || '') + '</td>'
			);

			if (user.id == value.userId) {

				var
					cellElement = $('<td class="emphasize" title="Remove"></td>'),
					spanElement = $('<span>' + (value.userName || '') + '</span>');

				cellElement.click(function(event) {

					$.post('/stop', {label: value.label});

					spanElement.remove();
					cellElement.removeClass('emphasize');
          $('input[type="checkbox"][value="' + value.label + '"]').removeAttr('disabled');
					return false;

				});

				cellElement.append(spanElement);
				rowElement.append(cellElement);

			} else {
				rowElement.append('<td>' + (value.userName || '') + '</td>');
			}

			rowElement.append(
				'<td><time>' + (value.lastUsed ? moment(new Date(value.lastUsed)).fromNow() : '') + '</time></td>' +
				'<td><input type="checkbox" name="labels[]" value="' + value.label + '" ' + (value.userId ? 'disabled' : '') + '></td>'
    		);

	    	devicesList.append(rowElement);

		});

		$('#devices-list [contenteditable]').blur(function(event) {

			var
				element = $(event.target),
				label = element.parent().attr('data-label'),
				key = element.attr('data-key'),
				value = element.text();

			$.post('/save', {label: label, key: key, value: value});

		});

		$('#devices-list [contenteditable]').keypress(function(event) {
			if (event.which == 13) {
				event.target.blur();
				return false;
			}
		});

	});

}





function selectSubmit(event) {

	var address = $('#address').val();

	localStorage.setItem('address', address);

	$.post('/start', $('#devices-form').serialize());

	var interval = setInterval(function() {
		$.getJSON('/ping', {user_id: user.id}, function(data) {
			if (data.address) {
				clearInterval(interval);
				setTimeout(function() {
					location = data.address;
				}, 1000);
			}
		});
	}, 1000);

	$('#container').addClass('centerized');
	$('#stop-testing').show();
	$('#go').hide();

	setTimeout(function() {

		$('#devices').hide();
		$('#content').removeClass('devices');

		setTimeout(function() {
			$('#wait').show();
		}, 300);

	}, 0);


	return false;

}

function stopTesting() {
  $.post('/stop', {userId: user.id}, function() {
    $('#stop-testing').hide();
    $('#go').show();
  });
}




exports = module.exports = {
  start: start
};
