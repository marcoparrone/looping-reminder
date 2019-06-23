import React from 'react';
import './App.css';

// Register the service worker.
navigator.serviceWorker.register('notification.js');

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


function AddReminder (props) {
    return (
        <button onClick={props.handler}>Add a reminder</button>
    );
}

class Reminder extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            id: props.id,
            title: props.title,
            interval: props.interval,
            body: props.body,
            icon: props.icon,
            setTitleHandler: props.setTitleHandler,
            setIntervalHandler: props.setIntervalHandler,
            setBodyHandler: props.setBodyHandler,
            setIconHandler: props.setIconHandler
        };
        this.reminderRef = React.createRef();
    }

    // Equalize the legth of the labels, for a more graphically pleasing interface.
    makeLabelsEqualSized () {
        var labels = this.reminderRef.current.querySelectorAll("label");
        var maxLabelSize = 0;
        labels.forEach (function(label) {
            var currLabelSize = parseInt(window.getComputedStyle(label).width);
            if (currLabelSize > maxLabelSize) {
                maxLabelSize = currLabelSize;
            }
        });
        maxLabelSize += 5;
        var maxLabelSizeString = maxLabelSize.toString() + "px";
        labels.forEach (function(label) {
            label.style.width = maxLabelSizeString;
        });
    }

    componentDidMount() {
        this.makeLabelsEqualSized () ;
    }
    
    componentWillUnmount() {
        
    }

    setTitle (value) {
        this.setState({
            title: value
        });
        this.state.setTitleHandler(this.state.id,value);
    }

    setInterval (value) {
        var interval = 0;
        if (isNaN(value)) {
	    alert ('Interval must be a number');
        } else {
	    interval = parseInt (value);
	    if (interval > 864000000) {
	        alert('Selected interval is too big');
	    } else {
                this.setState({
                    interval: value
                });
                this.state.setIntervalHandler(this.state.id,value);
	    }
        }
    }

    setBody (value) {
        this.setState({
            body: value
        });
        this.state.setBodyHandler(this.state.id,value);
    }

    setIcon (value) {
        this.setState({
            icon: value
        });
        this.state.setIconHandler(this.state.id,value);
    }

    render () {
        return (
            <div ref={this.reminderRef}>
              <label>Title:
                <input type="text"
                       id={"titleInput" + this.state.id}
                       value={this.state.title}
                       onChange={event => this.setTitle(event.target.value)}>
                </input>
              </label>
              <label>Interval:
                <input type="text"
                       id={"intervalInput" + this.state.id}
                       value={this.state.interval}
                       onChange={event => this.setInterval(event.target.value)}>
                </input>
              </label>
              <label>Body:
                <input type="text"
                       id={"bodyInput" + this.state.id}
                       value={this.state.body}
                       onChange={event => this.setBody(event.target.value)}>
                </input>
              </label>
              <label>Icon:
                <input type="text"
                       id={"iconInput" + this.state.id}
                       value={this.state.icon}
                       onChange={event => this.setIcon(event.target.value)}>
                </input>
              </label>
            </div>
        );
    }
}

class RemindersList extends React.Component {

    constructor(props) {
        super(props);
        this.state = {reminders: []};
        this.addReminderHandler = this.addReminderHandler.bind(this);
        this.setTitle = this.setTitle.bind(this);
        this.setInterval = this.setInterval.bind(this);
        this.setBody = this.setBody.bind(this);
        this.setIcon = this.setIcon.bind(this);
    }

    componentDidMount() {
        
    }
    
    componentWillUnmount() {
        
    }

    saveReminders (value) {
        this.setState({
            reminders: value
        });
        if (process.env.NODE_ENV === 'development') {
            console.log(this.state.reminders);
        }
    }

    addReminderHandler() {
        this.addReminder ();
    }

    setSchedule (reminder) {
        var schedule = reminder.schedule;
        if (schedule != null) {
	    clearInterval(schedule);
        }
        return setInterval(function () {reminderNotify(reminder.title, reminder.body, reminder.icon)},
                           parseInt(reminder.interval) * 1000);
    }

    setTitle (id, value) {
        var reminders = this.state.reminders;
        var intID = parseInt(id);
        reminders[intID].title = value;
        reminders[intID].schedule = this.setSchedule (reminders[intID]);
        this.saveReminders (reminders);
    }

    setInterval (id, value) {
        var reminders = this.state.reminders;
        var intID = parseInt(id);
        reminders[intID].interval = value;
        reminders[intID].schedule = this.setSchedule (reminders[intID]);
        this.saveReminders (reminders);
    }

    setBody (id, value) {
        var reminders = this.state.reminders;
        var intID = parseInt(id);
        reminders[intID].body = value;
        reminders[intID].schedule = this.setSchedule (reminders[intID]);
        this.saveReminders (reminders);
    }

    setIcon (id, value) {
        var reminders = this.state.reminders;
        var intID = parseInt(id);
        reminders[intID].icon = value;
        reminders[intID].schedule = this.setSchedule (reminders[intID]);
        this.saveReminders (reminders);
    }

    addReminder() {
        var reminders = this.state.reminders;
        var last = reminders.length;
        var newReminder = {
	    title: "ExampleTitle" + last.toString(),
	    interval: "600",
	    body: "ExampleBody" + last.toString(),
	    icon: "reminder-512.png",
	    schedule: null
        };
        reminders.push(newReminder);
        this.saveReminders (reminders);
    }

    render () {
        var remindersCount = this.state.reminders.length;
        var remindersRepresentation = [];
        for (var i = 0; i < remindersCount; i++) {
            remindersRepresentation.push(
                <Reminder
                  id={i.toString()}
                  key={"Reminder" + i}
                  title={this.state.reminders[i].title}
                  interval={this.state.reminders[i].interval}
                  body={this.state.reminders[i].body}
                  icon={this.state.reminders[i].icon}
                  setTitleHandler={this.setTitle}
                  setIntervalHandler={this.setInterval}
                  setBodyHandler={this.setBody}
                  setIconHandler={this.setIcon}
                />);
        }
        return (
	    <div>
              {remindersRepresentation}
              <AddReminder handler={this.addReminderHandler}/>
            </div>
        );
    }
}

function App() {
    return (
        <div className="App">
	  <header className="App-header">
            <RemindersList/>
          </header>
        </div>
    );
}

export default App;
