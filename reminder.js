var mySchedule = null;
var myTitle = 'Reminder';
var myBody = 'Reminder';

function isNewNotificationSupported() {
    if (!window.Notification || !Notification.requestPermission)
        return false;
    if (Notification.permission == 'granted') {
        throw new Error('You must only call this before calling Notification.requestPermission(), otherwise this feature detect would bug the user with an actual notification!');
    }
    try {
        new Notification('');
    } catch (e) {
        if (e.name == 'TypeError')
            return false;
    }
    return true;
}

function notifyMe() {
    if (window.Notification && Notification.permission == 'granted') {
	navigator.serviceWorker.getRegistrations().then(function(registrations) {
	    registrations[0].showNotification(myTitle, {
		body: myBody,
		icon: 'reminder-256.png',
		tag: 'looping-reminder'
	    });
	});
    } else if (isNewNotificationSupported()) {
	Notification.requestPermission();
    }
}

navigator.serviceWorker.register('service-worker.js');
function changeInterval() {
    var interval =  document.getElementById("intervalInput").value;
    document.getElementById("intervalText").innerHTML = interval;
    myTitle = document.getElementById("titleInput").value;
    myBody = document.getElementById("bodyInput").value;
    if (mySchedule != null) {
	clearInterval(mySchedule);
    }
    if (window.Notification && Notification.permission == 'granted') {
	mySchedule = setInterval(notifyMe, interval * 1000);
    } else if (isNewNotificationSupported()) {
	Notification.requestPermission();
    }
}
