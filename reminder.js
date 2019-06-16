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
  if (Notification.permission !== 'granted')
    Notification.requestPermission();
  else {
    var notification = new Notification(myTitle, {
      icon: 'reminder-256.png',
      body: myBody,
    });
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