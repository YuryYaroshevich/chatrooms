function divEscapedContentElement(msg) {
	return $('<div></div>').text(msg);
}

function divSystemContentElement(msg) {
	return $('<div></div>').html('<i>' + msg + '</i>');
}

function processUserInput(chatApp, socket) {
	var msg = $('#send-message').val();
	var systemMsg;

	if (msg.charAt(0) === '/') {
		systemMsg = chatApp.processCommand(msg);
		if (systemMsg) {
			$('#messages').append(systemMsg);
		}
	} else {
		chatApp.sendMessage($('#room').text(), msg);
		$('#messages').append(divEscapedContentElement(msg));
		$('#messages').scrollTop($('#messages').prop('scrollHeight'));
	}

	$('#send-message').val('');
}

var socket = io.connect();
$(document).ready(function() {
	var chatApp = new Chat(socket);

	socket.on('nameResult', function(result) {
		var msg;
		if (result.success) {
			msg = 'You are now known as ' + result.name + '.';
		} else {
			msg = result.message;
		}
		$('#messages').append(divSystemContentElement(msg));
	});

	socket.on('joinResult', function(result) {
		$('#room').text(result.room);
		$('#messages').append(divSystemContentElement('Room changed.'));
	});

	socket.on('message', function(message) {
		var newElem = $('<div></div>').text(message.text);
		$('#messages').append(newElem);
	});

	socket.on('rooms', function(rooms) {
		$('#room-list').empty();

		for (var room in rooms) {
			room = room.substring(1, room.length);
			if (room !== '') {
				$('#room-list').append(divEscapedContentElement(room));
			}

			$('#room-list div').click(function() {
				chatApp.processCommand('/join ' + $(this).text());
				//$('#send-message').focus();
			});
		}
	});

	setInterval(function() {
		socket.emit('rooms');
	}, 1000);

	$('#send-message').focus();

	$('#send-form').submit(function() {
		processUserInput(chatApp, socket);
		return false;
	});
});