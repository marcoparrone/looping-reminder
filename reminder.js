var mySchedule = null;
var myTitle = 'Reminder';
var myBody = 'Reminder';

navigator.serviceWorker.register('service-worker.js');
Notification.requestPermission();

function notifyMe() {
    try {
	navigator.serviceWorker.getRegistration()
	    .then(reg => reg.showNotification(myTitle, {
		body: myBody,
		icon: 'reminder-256.png',
		tag: 'looping-reminder'
	    }))
	    .catch(err => alert('Service Worker registration error: ' + err));
    } catch (err) {
	alert('Notification API error: ' + err);
    }
}

function changeInterval() {
    var interval =  document.getElementById("intervalInput").value;
    document.getElementById("intervalText").innerHTML = interval;
    myTitle = document.getElementById("titleInput").value;
    myBody = document.getElementById("bodyInput").value;
    if (mySchedule != null) {
	clearInterval(mySchedule);
    }
    mySchedule = setInterval(notifyMe, interval * 1000);
}
