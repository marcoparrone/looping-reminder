var mySchedule = null;
var myTitle = 'Reminder';
var myBody = 'Reminder';

document.addEventListener('DOMContentLoaded', function () {
  if (!Notification) {
    alert('Desktop notifications not available in your browser. Try Chrome.'); 
    return;
  }

  if (Notification.permission !== 'granted')
    Notification.requestPermission();
});

function notifyMe() {
  Notification.requestPermission(function(result) {
    if (result === 'granted') {
      navigator.serviceWorker.ready.then(function(registration) {
        registration.showNotification(myTitle, {
          body: myBody,
          icon: 'reminder-256.png',
//          vibrate: [200, 100, 200, 100, 200, 100, 200],
          tag: 'looping-reminder'
        });
      });
    }
  });
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
