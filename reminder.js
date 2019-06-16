var reminders = new Array ();

navigator.serviceWorker.register('service-worker.js');

document.addEventListener('DOMContentLoaded', function () {
    Notification.requestPermission();
});

function reminderNotify(title, body) {
    try {
	navigator.serviceWorker.getRegistration()
	    .then(reg => reg.showNotification(title, {
		body: body,
		icon: 'reminder-256.png',
		tag: 'looping-reminder'
	    }))
	    .catch(err => alert('Service Worker registration error: ' + err));
    } catch (err) {
	alert('Notification API error: ' + err);
    }
}

function updateReminder(reminderID) {
    var reminderIdString = reminderID.toString();
    reminders[reminderID][0] = reminders[reminderID][3].querySelector( "#" + "titleInput" + reminderIdString).value;
    reminders[reminderID][1] = reminders[reminderID][3].querySelector( "#" + "intervalInput" + reminderIdString).value;
    reminders[reminderID][2] = reminders[reminderID][3].querySelector( "#" + "bodyInput" + reminderIdString).value;
    if (reminders[reminderID][4] != null) {
	clearInterval(reminders[reminderID][4]);
    }
    reminders[reminderID][4] = setInterval(function () { reminderNotify(reminders[reminderID][0], reminders[reminderID][2]) }, reminders[reminderID][1] * 1000);
}

function addReminderToDocument (title, interval, body, reminderID) {
    var reminderDiv = document.createElement("div");
    
    var reminderTitleLabel = document.createElement("label");
    var reminderTitleInput = document.createElement("input");

    var reminderIntervalLabel = document.createElement("label");
    var reminderIntervalInput = document.createElement("input");

    var reminderBodyLabel = document.createElement("label");
    var reminderBodyInput = document.createElement("input");

    var reminderIDString = reminderID.toString();

    reminderDiv.appendChild(reminderTitleLabel);
    reminderDiv.appendChild(reminderIntervalLabel);
    reminderDiv.appendChild(reminderBodyLabel);    

    reminderTitleLabel.appendChild(document.createTextNode("Title: "));
    reminderIntervalLabel.appendChild(document.createTextNode("Interval: "));
    reminderBodyLabel.appendChild(document.createTextNode("Body: "));

    reminderTitleLabel.appendChild(reminderTitleInput);
    reminderIntervalLabel.appendChild(reminderIntervalInput);
    reminderBodyLabel.appendChild(reminderBodyInput);

    reminderTitleInput.setAttribute("type","text");
    reminderIntervalInput.setAttribute("type","text");
    reminderBodyInput.setAttribute("type","text");

    reminderTitleInput.setAttribute("id","titleInput" + reminderIDString);
    reminderIntervalInput.setAttribute("id","intervalInput" + reminderIDString);
    reminderBodyInput.setAttribute("id","bodyInput" + reminderIDString);

    reminderTitleInput.setAttribute("value", title);
    reminderIntervalInput.setAttribute("value", interval.toString());
    reminderBodyInput.setAttribute("value", body);

    reminderTitleInput.onchange = function () {updateReminder(reminderID);};
    reminderIntervalInput.onchange = function () {updateReminder(reminderID);};
    reminderBodyInput.onchange = function () {updateReminder(reminderID);};

    reminders[reminderID][3] = reminderDiv;
    
    updateReminder(reminderID);

    document.getElementById("appContent").appendChild(reminderDiv);
}

function initApp () {
    var remindersCount = reminders.length;
    for (var i = 0; i < remindersCount; i++) {
	addReminderToDocument(reminders[i][0],reminders[i][1],reminders[i][2],i);
    }
}

function addReminder() {
    var last = reminders.length;
    reminders.push(["ExampleTitle" + last.toString(), 600, "ExampleBody" + last.toString()]);
    addReminderToDocument(reminders[last][0],reminders[last][1],reminders[last][2],last);
}
