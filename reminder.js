// Main data object - contains everything related to the reminders.
var reminders = new Array ();

// Register the service worker.
navigator.serviceWorker.register('service-worker.js');

// Request permission for the notifications on page load.
document.addEventListener('DOMContentLoaded', function () {
    Notification.requestPermission();
});

// Add a notification for the reminder.
function reminderNotify(title, body, icon) {
    try {
	navigator.serviceWorker.getRegistration()
	    .then(reg => reg.showNotification(title, {
		body: body,
		icon: icon
	    }))
	    .catch(err => alert('Service Worker registration error: ' + err));
    } catch (err) {
	alert('Notification API error: ' + err);
    }
}

// Update the reminder from the input data and update the notification and its schedulation.
function updateReminder(reminderID) {
    var intervalString = "";
    var interval = 0;
    var reminderIdString = reminderID.toString();
    reminders[reminderID].title = reminders[reminderID].element.querySelector( "#" + "titleInput" + reminderIdString).value;
    intervalString = reminders[reminderID].element.querySelector( "#" + "intervalInput" + reminderIdString).value;
    if (isNaN(intervalString)) {
	alert ('Interval value is not a number for "' + reminders[reminderID].title + '" - it will be reverted.');
	reminders[reminderID].element.querySelector( "#" + "intervalInput" + reminderIdString).value = reminders[reminderID].interval.toString();
    } else {
	interval = parseInt (intervalString);
	if (interval > 864000000) {
	    alert('Selected interval is too big for "' + reminders[reminderID].title + '"- it will be reverted.');
	    reminders[reminderID].element.querySelector( "#" + "intervalInput" + reminderIdString).value = reminders[reminderID].interval.toString();
	} else {
	    reminders[reminderID].interval = interval.toString();
	}
    }
    reminders[reminderID].body = reminders[reminderID].element.querySelector( "#" + "bodyInput" + reminderIdString).value;
    reminders[reminderID].icon = reminders[reminderID].element.querySelector( "#" + "iconInput" + reminderIdString).value;
    if (reminders[reminderID].schedule != null) {
	clearInterval(reminders[reminderID].schedule);
    }
    reminders[reminderID].schedule = setInterval(function () { reminderNotify(reminders[reminderID].title, reminders[reminderID].body, reminders[reminderID].icon) }, parseInt(reminders[reminderID].interval) * 1000);
}

// Add all the graphic elements of a reminder to the document.
function addReminderToDocument (reminderID) {
    var reminderDiv = document.createElement("div");
    
    var reminderTitleLabel = document.createElement("label");
    var reminderTitleInput = document.createElement("input");

    var reminderIntervalLabel = document.createElement("label");
    var reminderIntervalInput = document.createElement("input");

    var reminderBodyLabel = document.createElement("label");
    var reminderBodyInput = document.createElement("input");

    var reminderIconLabel = document.createElement("label");
    var reminderIconInput = document.createElement("input");
    
    var reminderIDString = reminderID.toString();

    reminderDiv.appendChild(reminderTitleLabel);
    reminderDiv.appendChild(reminderIntervalLabel);
    reminderDiv.appendChild(reminderBodyLabel);
    reminderDiv.appendChild(reminderIconLabel);

    reminderTitleLabel.appendChild(document.createTextNode("Title: "));
    reminderIntervalLabel.appendChild(document.createTextNode("Interval: "));
    reminderBodyLabel.appendChild(document.createTextNode("Body: "));
    reminderIconLabel.appendChild(document.createTextNode("Icon: "));

    reminderTitleLabel.appendChild(reminderTitleInput);
    reminderIntervalLabel.appendChild(reminderIntervalInput);
    reminderBodyLabel.appendChild(reminderBodyInput);
    reminderIconLabel.appendChild(reminderIconInput);

    reminderTitleInput.setAttribute("type","text");
    reminderIntervalInput.setAttribute("type","text");
    reminderBodyInput.setAttribute("type","text");
    reminderIconInput.setAttribute("type","text");

    reminderTitleInput.setAttribute("id","titleInput" + reminderIDString);
    reminderIntervalInput.setAttribute("id","intervalInput" + reminderIDString);
    reminderBodyInput.setAttribute("id","bodyInput" + reminderIDString);
    reminderIconInput.setAttribute("id","iconInput" + reminderIDString);

    reminderTitleInput.setAttribute("value", reminders[reminderID].title);
    reminderIntervalInput.setAttribute("value", reminders[reminderID].interval);
    reminderBodyInput.setAttribute("value", reminders[reminderID].body);
    reminderIconInput.setAttribute("value", reminders[reminderID].icon);

    reminderTitleInput.onchange = function () {updateReminder(reminderID);};
    reminderIntervalInput.onchange = function () {updateReminder(reminderID);};
    reminderBodyInput.onchange = function () {updateReminder(reminderID);};
    reminderIconInput.onchange = function () {updateReminder(reminderID);};

    // Store the root element of the reminder for later reference.
    reminders[reminderID].element = reminderDiv;

    // Update reminder and schedulation.
    updateReminder(reminderID);

    // Add the reminder to the document.
    document.getElementById("appContent").appendChild(reminderDiv);

    // Equalize the legth of the labels, for a more graphically pleasing interface.
    var labelSizes = new Array ();
    labelSizes[0] = parseInt (window.getComputedStyle(reminderTitleLabel).width);
    labelSizes[1] = parseInt (window.getComputedStyle(reminderIntervalLabel).width);
    labelSizes[2] = parseInt (window.getComputedStyle(reminderBodyLabel).width);
    labelSizes[3] = parseInt (window.getComputedStyle(reminderIconLabel).width);
    var maxLabelSize = 0;
    for (var i = 0; i < labelSizes.length; i++) {
	if (labelSizes[i] > maxLabelSize) {
	    maxLabelSize = labelSizes[i];
	}
    }
    maxLabelSize += 5;
    var maxLabelSizeString = maxLabelSize.toString() + "px";
    reminderTitleLabel.style.width = maxLabelSizeString;
    reminderIntervalLabel.style.width = maxLabelSizeString;
    reminderBodyLabel.style.width = maxLabelSizeString;
    reminderIconLabel.style.width = maxLabelSizeString;
}

// Initialize the application.
function initApp () {
    var remindersCount = reminders.length;
    for (var i = 0; i < remindersCount; i++) {
	addReminderToDocument(i);
    }
}

// Add a reminder.
function addReminder() {
    var last = reminders.length;
    var newReminder = {
	title: "ExampleTitle" + last.toString(),
	interval: "600",
	body: "ExampleBody" + last.toString(),
	icon: "reminder-512.png",
	element: null,
	schedule: null
    };
    reminders.push(newReminder);
    addReminderToDocument(last);
    // Give another chance to give the permission to notifications.
    Notification.requestPermission();
}
