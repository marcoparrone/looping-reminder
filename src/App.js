import React from 'react';
import './App.css';

import '@material/react-top-app-bar/dist/top-app-bar.css';
import '@material/react-material-icon/dist/material-icon.css';

import TopAppBar, {
  TopAppBarFixedAdjust,
  TopAppBarIcon,
  TopAppBarRow,
  TopAppBarSection,
  TopAppBarTitle,
} from '@material/react-top-app-bar';
import MaterialIcon from '@material/react-material-icon';

import "@material/snackbar/dist/mdc.snackbar.css";
import { MDCSnackbar } from '@material/snackbar';

import "@material/dialog/dist/mdc.dialog.css";
import { MDCDialog } from '@material/dialog';

import "@material/card/dist/mdc.card.css";

import saveAs from 'file-saver';

import get_timestamp from './timestamp';

// Register the service worker.
"serviceWorker"in navigator && navigator.serviceWorker.register('notification.js');

// Add a notification for the reminder.
function reminderNotify(title, body, icon) {
  try {
    navigator.serviceWorker.getRegistration()
      .then(reg => reg.showNotification(title, {
        body: body,
        icon: icon
      }))
      .catch(err => console.log('Service Worker registration error: ' + err));
  } catch (err) {
    console.log('Notification API error: ' + err);
  }
}

class EnableNotifications extends React.Component {
  constructor(props) {
    super(props);
    if (Notification.permission === "granted") {
      this.state = {
        permission: true
      };
    } else {
      this.state = {
        permission: false
      };
    }
  }

  askPermission() {
    let reference = this;
    Notification.requestPermission(function (result) {
      if (Notification.permission === "granted") {
        reference.setState({
          permission: true
        });
      }
    });
  }

  render() {
    return (
      <div>
        {
          this.state.permission ||
          <div>Notifications must be enabled to use this application:
                      <button onClick={event => this.askPermission()}>Enable notifications</button>
          </div>
        }
      </div>
    );
  }
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
      visible: props.visible,
      setTitleHandler: props.setTitleHandler,
      setIntervalHandler: props.setIntervalHandler,
      setBodyHandler: props.setBodyHandler,
      setIconHandler: props.setIconHandler,
      movebackwardReminder: props.movebackwardReminder,
      moveforwardReminder: props.moveforwardReminder,
      deleteReminder: props.deleteReminder,
      remindersListRef: props.remindersListRef
    };
    this.reminderRef = React.createRef();
  }

  // Equalize the legth of the labels, for a more graphically pleasing interface.
  makeLabelsEqualSized() {
    let labels = this.reminderRef.current.querySelectorAll("label");
    let maxLabelSize = 0;
    labels.forEach(function (label) {
      let currLabelSize = parseInt(window.getComputedStyle(label).width);
      if (currLabelSize > maxLabelSize) {
        maxLabelSize = currLabelSize;
      }
    });
    maxLabelSize += 5;
    let maxLabelSizeString = maxLabelSize.toString() + "px";
    labels.forEach(function (label) {
      label.style.width = maxLabelSizeString;
    });
  }

  componentDidMount() {
    this.makeLabelsEqualSized();
  }

  componentWillUnmount() {

  }

  setTitle(value) {
    this.setState({
      title: value
    });
    this.state.setTitleHandler(this.state.id, value);
  }

  setInterval(value) {
    const snackbarMBN = new MDCSnackbar(this.state.remindersListRef.current.querySelector('#mustBeNum'));
    const snackbarTB = new MDCSnackbar(this.state.remindersListRef.current.querySelector('#tooBig'));
    const snackbarTS = new MDCSnackbar(this.state.remindersListRef.current.querySelector('#tooSmall'));
    let interval = 0;
    if (isNaN(value) || value === "") {
      snackbarMBN.open();
    } else {
      interval = parseInt(value);
      if (interval > 604800) {
        snackbarTB.open();
      } else if (interval < 1) {
        snackbarTS.open();
      } else {
        this.setState({
          interval: value
        });
        this.state.setIntervalHandler(this.state.id, value);
      }
    }
  }

  setBody(value) {
    this.setState({
      body: value
    });
    this.state.setBodyHandler(this.state.id, value);
  }

  setIcon(value) {
    this.setState({
      icon: value
    });
    this.state.setIconHandler(this.state.id, value);
  }

  render() {
    return (
      <div className="mdc-card mdc-card--outlined" ref={this.reminderRef}>
        <div>
          <label>Title:
                  <input type="text"
              id={"titleInput" + this.state.id}
              value={this.state.title}
              onChange={event => this.setTitle(event.target.value)}>
            </input>
          </label><br />
          <label>Interval:
                  <input type="text"
              id={"intervalInput" + this.state.id}
              value={this.state.interval}
              onChange={event => this.setInterval(event.target.value)}>
            </input>
          </label><br />
          <label>Body:
                  <input type="text"
              id={"bodyInput" + this.state.id}
              value={this.state.body}
              onChange={event => this.setBody(event.target.value)}>
            </input>
          </label><br />
          <label>Icon:
                  <input type="text"
              id={"iconInput" + this.state.id}
              value={this.state.icon}
              onChange={event => this.setIcon(event.target.value)}>
            </input>
          </label><br />
        </div>
        <div className="mdc-card__action-icons">
          <button className="material-icons mdc-icon-button mdc-card__action mdc-card__action--icon"
            title="Move Backward"
            onClick={event => this.state.movebackwardReminder(this.state.id)}>keyboard_arrow_left</button>
          <button className="material-icons mdc-icon-button mdc-card__action mdc-card__action--icon"
            title="Move Forward"
            onClick={event => this.state.moveforwardReminder(this.state.id)}>keyboard_arrow_right</button>
          <button className="material-icons mdc-icon-button mdc-card__action mdc-card__action--icon"
            title="Delete"
            onClick={event => this.state.deleteReminder(this.state.id)}>delete</button>
        </div>
      </div>
    );
  }
}

class RemindersList extends React.Component {

  constructor(props) {
    super(props);
    this.reminders = [];
    this.state = {
      reminders: []
    };
    this.setTitle = this.setTitle.bind(this);
    this.setInterval = this.setInterval.bind(this);
    this.setBody = this.setBody.bind(this);
    this.setIcon = this.setIcon.bind(this);
    this.movebackwardReminder = this.movebackwardReminder.bind(this);
    this.moveforwardReminder = this.moveforwardReminder.bind(this);
    this.deleteReminder = this.deleteReminder.bind(this);
    this.about = this.about.bind(this);
    this.help = this.help.bind(this);
    this.importExportReminders = this.importExportReminders.bind(this);
    this.importRemindersReaderOnload = this.importRemindersReaderOnload.bind(this);
    this.importReminders = this.importReminders.bind(this);
    this.exportReminders = this.exportReminders.bind(this);
    this.remindersListRef = React.createRef();
  }

  componentDidMount() {
    this.loadReminders();
  }

  componentWillUnmount() {

  }

  importExportReminders() {
    const dialog = new MDCDialog(this.remindersListRef.current.querySelector('#impexp'));
    dialog.open();
  }

  help() {
    const dialog = new MDCDialog(this.remindersListRef.current.querySelector('#help'));
    dialog.open();
  }

  about() {
    const dialog = new MDCDialog(this.remindersListRef.current.querySelector('#about'));
    dialog.open();
  }

  saveReminders() {
    let newReminders = [];

    // I don't want for the visible value to grow indefinitely.
    for (let i = 0; i < this.reminders.length; i++) {
      if (this.reminders[i].visible > 100) {
        this.reminders[i].visible -= 100;
      }
    }

    // Save in current state.
    this.setState({
      reminders: this.reminders
    });

    // Save in local storage, skipping deleted reminders.
    for (let i = 0; i < this.reminders.length; i++) {
      if (this.reminders[i].visible !== 0) {
        newReminders.push(this.reminders[i]);
      }
    }
    localStorage.setItem('reminders', JSON.stringify(newReminders));
  }

  setSchedule(reminder) {
    let schedule = reminder.schedule;
    if (schedule != null) {
      clearInterval(schedule);
    }
    return setInterval(function () { reminderNotify(reminder.title, reminder.body, reminder.icon) },
      parseInt(reminder.interval) * 1000);
  }

  setTitle(id, value) {
    let intID = parseInt(id);
    this.reminders[intID].title = value;
    this.reminders[intID].schedule = this.setSchedule(this.reminders[intID]);
    this.saveReminders();
  }

  setInterval(id, value) {
    let intID = parseInt(id);
    this.reminders[intID].interval = value;
    this.reminders[intID].schedule = this.setSchedule(this.reminders[intID]);
    this.saveReminders();
  }

  setBody(id, value) {
    let intID = parseInt(id);
    this.reminders[intID].body = value;
    this.reminders[intID].schedule = this.setSchedule(this.reminders[intID]);
    this.saveReminders();
  }

  setIcon(id, value) {
    let intID = parseInt(id);
    this.reminders[intID].icon = value;
    this.reminders[intID].schedule = this.setSchedule(this.reminders[intID]);
    this.saveReminders();
  }

  loadReminders() {
    let reminders = localStorage.getItem('reminders');
    if (reminders) {
      this.reminders = JSON.parse(reminders);
      this.setState({
        reminders: this.reminders
      });

      for (let i = 0; i < this.reminders.length; i++) {
        this.reminders[i].schedule = null;
        this.reminders[i].schedule = this.setSchedule(this.reminders[i]);
      }
    }
  }

  addReminder() {
    let last = this.reminders.length;
    let newReminder = {
      title: "ExampleTitle" + last.toString(),
      interval: "600",
      body: "ExampleBody" + last.toString(),
      icon: "reminder-512.png",
      schedule: null,
      visible: 1
    };
    this.reminders.push(newReminder);
    this.saveReminders();
  }

  // swap the properties of reminder with ID a with the properties of the reminder with id b
  swapReminders(a, b) {
    let tmpreminder = {};
    if (this.reminders[a].visible !== 0 && this.reminders[b].visible !== 0) {
      tmpreminder.title = this.reminders[a].title;
      tmpreminder.interval = this.reminders[a].interval;
      tmpreminder.body = this.reminders[a].body;
      tmpreminder.icon = this.reminders[a].icon;
      tmpreminder.schedule = this.reminders[a].schedule;
      tmpreminder.visible = this.reminders[a].visible;

      this.reminders[a].title = this.reminders[b].title;
      this.reminders[a].interval = this.reminders[b].interval;
      this.reminders[a].body = this.reminders[b].body;
      this.reminders[a].icon = this.reminders[b].icon;
      this.reminders[a].schedule = this.reminders[b].schedule;
      this.reminders[a].visible = this.reminders[b].visible + 1;

      this.reminders[b].title = tmpreminder.title;
      this.reminders[b].interval = tmpreminder.interval;
      this.reminders[b].body = tmpreminder.body;
      this.reminders[b].icon = tmpreminder.icon;
      this.reminders[b].schedule = tmpreminder.schedule;
      this.reminders[b].visible = tmpreminder.visible + 1;
    }
  }

  movebackwardReminder(id) {
    let intID = parseInt(id);
    for (let otherID = intID - 1; otherID >= 0 && otherID < this.reminders.length; otherID--) {
      if (this.reminders[otherID].visible !== 0) {
        this.swapReminders(intID, otherID);
        break;
      }
    }
    this.saveReminders();
  }

  moveforwardReminder(id) {
    let intID = parseInt(id);
    for (let otherID = intID + 1; otherID >= 0 && otherID < this.reminders.length; otherID++) {
      if (this.reminders[otherID].visible !== 0) {
        this.swapReminders(intID, otherID);
        break;
      }
    }
    this.saveReminders();
  }

  deleteReminder(id) {
    let intID = parseInt(id);
    if (this.reminders[intID].schedule != null) {
      clearInterval(this.reminders[intID].schedule);
      this.reminders[intID].schedule = null;
    }
    this.reminders[intID].visible = 0;
    this.saveReminders();
    this.forceUpdate();
  }

  importRemindersReaderOnload(e) {
    let newReminders = JSON.parse(e.target.result);
    if (newReminders.length > 0) {
      // Delete old schedules.
      for (let i = 0; i < this.reminders.length; i++) {
        this.deleteReminder(i);
      }
      // Replace old reminders with new reminders
      this.reminders = newReminders;
      // Save and display.
      this.saveReminders();
      this.forceUpdate();
    }
  }

  importReminders(e) {
    let file = e.target.files[0];
    if (!file) {
      if (e.target.files.length > 0) {
        alert('error: cannot load file.');
      }
      return;
    }
    let reader = new FileReader();
    reader.onload = this.importRemindersReaderOnload;
    reader.readAsText(file);
  }

  exportReminders() {
    let newReminders = [];

    // Save in current state.
    this.setState({
      reminders: this.reminders
    });

    // Export to JSON file, skipping deleted reminders.
    for (let i = 0; i < this.reminders.length; i++) {
      if (this.reminders[i].visible !== 0) {
        newReminders.push(this.reminders[i]);
      }
    }

    saveAs(new Blob([JSON.stringify(newReminders)], { type: "application/json;charset=utf-8" }),
      'reminders-' + get_timestamp() + '.json');
  }

  render() {
    let remindersCount = this.state.reminders.length;
    let remindersRepresentation = [];
    for (let i = 0; i < remindersCount; i++) {
      if (this.reminders[i].visible !== 0) {
        remindersRepresentation.push(
          <Reminder
            id={i.toString()}
            key={'Reminder' + i + '-' + this.reminders[i].visible}
            title={this.state.reminders[i].title}
            interval={this.state.reminders[i].interval}
            body={this.state.reminders[i].body}
            icon={this.state.reminders[i].icon}
            visible={this.state.reminders[i].visible}
            setTitleHandler={this.setTitle}
            setIntervalHandler={this.setInterval}
            setBodyHandler={this.setBody}
            setIconHandler={this.setIcon}
            movebackwardReminder={this.movebackwardReminder}
            moveforwardReminder={this.moveforwardReminder}
            deleteReminder={this.deleteReminder}
            remindersListRef={this.remindersListRef}
          />);
      }
    }
    return (
      <div ref={this.remindersListRef}>
        <TopAppBar>
          <TopAppBarRow>
            <TopAppBarSection align='start'>
              <TopAppBarTitle>Looping Reminder</TopAppBarTitle>
            </TopAppBarSection>
            <TopAppBarSection align='end' role='toolbar'>
              <TopAppBarIcon actionItem tabIndex={0}>
                <MaterialIcon
                  aria-label="add a reminder"
                  hasRipple
                  icon='add'
                  onClick={() => this.addReminder()}
                />
              </TopAppBarIcon>
              <TopAppBarIcon actionItem tabIndex={0}>
                <MaterialIcon
                  aria-label="import and export reminders"
                  hasRipple
                  icon='import_export'
                  onClick={() => this.importExportReminders()}
                />
              </TopAppBarIcon>
              <TopAppBarIcon actionItem tabIndex={0}>
                <MaterialIcon
                  aria-label="help"
                  hasRipple
                  icon='help'
                  onClick={() => this.help()}
                />
              </TopAppBarIcon>
              <TopAppBarIcon actionItem tabIndex={0}>
                <MaterialIcon
                  aria-label="about"
                  hasRipple
                  icon='info'
                  onClick={() => this.about()}
                />
              </TopAppBarIcon>
            </TopAppBarSection>
          </TopAppBarRow>
        </TopAppBar>
        <TopAppBarFixedAdjust>

          <EnableNotifications />

          <section className="remindersSection">
            {remindersRepresentation}
          </section>

          <div className="mdc-snackbar" id="mustBeNum"><div className="mdc-snackbar__surface"><div className="mdc-snackbar__label" role="status" aria-live="polite">Interval must be a number!</div></div></div>
          <div className="mdc-snackbar" id="tooBig"><div className="mdc-snackbar__surface"><div className="mdc-snackbar__label" role="status" aria-live="polite">Selected interval is too big!</div></div></div>
          <div className="mdc-snackbar" id="tooSmall"><div className="mdc-snackbar__surface"><div className="mdc-snackbar__label" role="status" aria-live="polite">Selected interval is too small!</div></div></div>

          <div className="mdc-dialog" role="alertdialog" aria-modal="true" aria-labelledby="my-dialog-title" aria-describedby="my-dialog-content" id="impexp">
            <div className="mdc-dialog__container">
              <div className="mdc-dialog__surface">
                <h2 className="mdc-dialog__title" id="impexp-dialog-title">Import/export</h2>
                <div className="mdc-dialog__content" id="impexp-dialog-content">
                  <p>Here you can import and export your reminders in JSON format.</p>
                </div>
                <footer className="mdc-dialog__actions">
                  <label>Import:&nbsp;<input type="file" onChange={e => this.importReminders(e)} className="mdc-button mdc-dialog__button" data-mdc-dialog-action="yes" /></label>
                  <input type="submit" value="Back" className="mdc-button mdc-dialog__button" data-mdc-dialog-action="yes" />
                  <input type="submit" value="Export" onClick={event => this.exportReminders()} className="mdc-button mdc-dialog__button" data-mdc-dialog-action="yes" />
                </footer>
              </div>
            </div>
          </div>

          <div className="mdc-dialog" role="alertdialog" aria-modal="true" aria-labelledby="my-dialog-title" aria-describedby="my-dialog-content" id="help">
            <div className="mdc-dialog__container">
              <div className="mdc-dialog__surface">
                <h2 className="mdc-dialog__title" id="help-dialog-title">Help</h2>
                <div className="mdc-dialog__content" id="help-dialog-content">
                  <p>Looping Reminder is an application which sends notifications at defined intervals of time.</p>
                  <p>To add a new reminder, press on the "plus" icon. Then, edit the text fields and insert the title of the notification, the interval (in seconds), the text that will be contained in the body of the notification, and the URL of an icon.</p>
                  <p>When the application is running in a browser, then the browser may disable the notifications if the application is not open in the active tab. If the application was installed, your device may suspend the application, especially if your device battery is low. So, use this application if it may be of any help to you, but don't use it for anything important.</p>
                  <p>To import or export the reminders, press on the import/export icon. When importing the reminders from a file, the current reminders will be deleted and overwritten.</p>
                  <p>Looping Reminder is a Progressive Web Application, which means that it runs inside a browser.
                    When you install it, while the browser components are not shown, it still runs inside a browser.
                    The reminders are saved in the browser's localStorage for the reminder.marcoparrone.com domain.
                    localStorage works fine with Chrome, Edge and Firefox browsers. Other browsers may delete localStorage after some time.
                    Android by default uses Chrome, Windows by default uses Edge. Looping Reminder currently is not supported on Apple products.
                    With the purpose to help preventing the loss of the reminders, it is suggested to make a backup using the "export" functionality, every time you make some modifications which you don't want to lose.</p>
                </div>
                <footer className="mdc-dialog__actions">
                  <button type="button" className="mdc-button mdc-dialog__button" data-mdc-dialog-action="yes">
                    <span className="mdc-button__label">Close</span>
                  </button>
                </footer>
              </div>
            </div>
            <div className="mdc-dialog__scrim"></div>
          </div>

          <div className="mdc-dialog" role="alertdialog" aria-modal="true" aria-labelledby="my-dialog-title" aria-describedby="my-dialog-content" id="about">
            <div className="mdc-dialog__container">
              <div className="mdc-dialog__surface">
                <h2 className="mdc-dialog__title" id="about-dialog-title">About</h2>
                <div className="mdc-dialog__content" id="about-dialog-content">
                  <p>Copyright &copy; 2019,2020,2021 Marco Parrone.</p>
                  <p>Permission is hereby granted, free of charge, to any person obtaining a copy
                  of this software and associated documentation files (the "Software"), to deal
                  in the Software without restriction, including without limitation the rights
                  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
                  copies of the Software, and to permit persons to whom the Software is
                  furnished to do so, subject to the following conditions:</p>
                  <p>The above copyright notice and this permission notice shall be included in all
                  copies or substantial portions of the Software.</p>
                  <p>THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
                  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
                  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
                  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
                  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
                  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
                  SOFTWARE.</p>
                </div>
                <footer className="mdc-dialog__actions">
                  <button type="button" className="mdc-button mdc-dialog__button" data-mdc-dialog-action="yes">
                    <span className="mdc-button__label">Close</span>
                  </button>
                </footer>
              </div>
            </div>
            <div className="mdc-dialog__scrim"></div>
          </div>
        </TopAppBarFixedAdjust>
      </div>
    );
  }
}

function App() {
  return (
    <div className="App">
      <RemindersList />
    </div>
  );
}

export default App;