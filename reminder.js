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
    var reminderIdString = reminderID.toString();
    reminders[reminderID][0] = reminders[reminderID][4].querySelector( "#" + "titleInput" + reminderIdString).value;
    reminders[reminderID][1] = reminders[reminderID][4].querySelector( "#" + "intervalInput" + reminderIdString).value;
    reminders[reminderID][2] = reminders[reminderID][4].querySelector( "#" + "bodyInput" + reminderIdString).value;
    reminders[reminderID][3] = reminders[reminderID][4].querySelector( "#" + "iconInput" + reminderIdString).value;
    if (reminders[reminderID][5] != null) {
	clearInterval(reminders[reminderID][5]);
    }
    reminders[reminderID][5] = setInterval(function () { reminderNotify(reminders[reminderID][0], reminders[reminderID][2], reminders[reminderID][3]) }, reminders[reminderID][1] * 1000);
}

// Add all the graphic elements of a reminder to the document.
function addReminderToDocument (title, interval, body, icon, reminderID) {
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

    reminderTitleInput.setAttribute("value", title);
    reminderIntervalInput.setAttribute("value", interval.toString());
    reminderBodyInput.setAttribute("value", body);
    reminderIconInput.setAttribute("value", icon);

    reminderTitleInput.onchange = function () {updateReminder(reminderID);};
    reminderIntervalInput.onchange = function () {updateReminder(reminderID);};
    reminderBodyInput.onchange = function () {updateReminder(reminderID);};
    reminderIconInput.onchange = function () {updateReminder(reminderID);};

    // Store the root element of the reminder for later reference.
    reminders[reminderID][4] = reminderDiv;

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
	addReminderToDocument(reminders[i][0],reminders[i][1],reminders[i][2],reminders[i][3],i);
    }
}

// Add a reminder.
function addReminder() {
    var last = reminders.length;
    Notification.requestPermission(); // Give another chance to give the permission to notifications.
    reminders.push(["ExampleTitle" + last.toString(), 600, "ExampleBody" + last.toString(), "reminder-512.png"]);
    addReminderToDocument(reminders[last][0],reminders[last][1],reminders[last][2],reminders[last][3],last);
}
