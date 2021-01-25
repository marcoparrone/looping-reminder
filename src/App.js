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

import I18n from '@marcoparrone/i18n';
import LanguageSelector from '@marcoparrone/react-language-selector';

import get_timestamp from './timestamp';

const defaultText = require ('./en.json');

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
          <div>{this.props.text_notifications1}
            <button onClick={event => this.askPermission()}>{this.props.text_notifications2}</button>
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

  componentDidMount() {

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
          <label htmlFor={"titleInput" + this.state.id}>{this.props.text_edit_title}</label>
          <input type="text"
            id={"titleInput" + this.state.id}
            value={this.state.title}
            onChange={event => this.setTitle(event.target.value)}>
          </input>
          <br />
          <label htmlFor={"intervalInput" + this.state.id}>{this.props.text_edit_interval}</label>
          <input type="text"
            id={"intervalInput" + this.state.id}
            value={this.state.interval}
            onChange={event => this.setInterval(event.target.value)}>
          </input>
          <br />
          <label htmlFor={"bodyInput" + this.state.id}>{this.props.text_edit_body}</label>
          <input type="text"
            id={"bodyInput" + this.state.id}
            value={this.state.body}
            onChange={event => this.setBody(event.target.value)}>
          </input>
          <br />
          <label htmlFor={"iconInput" + this.state.id}>{this.props.text_edit_icon}</label>
          <input type="text"
            id={"iconInput" + this.state.id}
            value={this.state.icon}
            onChange={event => this.setIcon(event.target.value)}>
          </input>
          <br />
        </div>
        <div className="mdc-card__action-icons">
          <button className="material-icons mdc-icon-button mdc-card__action mdc-card__action--icon"
            title={this.props.text_move_backward}
            onClick={event => this.state.movebackwardReminder(this.state.id)}>keyboard_arrow_left</button>
          <button className="material-icons mdc-icon-button mdc-card__action mdc-card__action--icon"
            title={this.props.text_move_forward}
            onClick={event => this.state.moveforwardReminder(this.state.id)}>keyboard_arrow_right</button>
          <button className="material-icons mdc-icon-button mdc-card__action mdc-card__action--icon"
            title={this.props.text_delete}
            onClick={event => this.state.deleteReminder(this.state.id)}>delete</button>
        </div>
      </div>
    );
  }
}

class RemindersList extends React.Component {

  constructor(props) {
    super(props);
    this.i18n = {};
    this.reminders = [];
    this.state = {
      reminders: [],
      language: 'en',
      text_appname: defaultText['text_appname'],
      text_add_label: defaultText['text_add_label'],
      text_settings_label: defaultText['text_settings_label'],
      text_importexport_label: defaultText['text_importexport_label'],
      text_help_label: defaultText['text_help_label'],
      text_about_label: defaultText['text_about_label'],
      text_snack_mustbenum: defaultText['text_snack_mustbenum'],
      text_snack_toobig: defaultText['text_snack_toobig'],
      text_snack_toosmall: defaultText['text_snack_toosmall'],
      text_settings_title: defaultText['text_settings_title'],
      text_settings_content1: defaultText['text_settings_content1'],
      text_language: defaultText['text_language'],
      text_close_button: defaultText['text_close_button'],
      text_importexport_title: defaultText['text_importexport_title'],
      text_importexport_content: defaultText['text_importexport_content'],
      text_back: defaultText['text_back'],
      text_import: defaultText['text_import'],
      text_export: defaultText['text_export'],
      text_error_loadfile: defaultText['text_error_loadfile'],
      text_error_fileformat: defaultText['text_error_fileformat'],
      text_notifications1: defaultText['text_notifications1'],
      text_notifications2: defaultText['text_notifications2'],
      text_example_title: defaultText['text_example_title'],
      text_example_content: defaultText['text_example_content'],
      text_edit_title: defaultText['text_edit_title'],
      text_edit_interval: defaultText['text_edit_interval'],
      text_edit_body: defaultText['text_edit_body'],
      text_edit_icon: defaultText['text_edit_icon'],
      text_move_backward: defaultText['text_move_backward'],
      text_move_forward: defaultText['text_move_forward'],
      text_delete: defaultText['text_delete'],
      text_help_title: defaultText['text_help_title'],
      text_help_content1: defaultText['text_help_content1'],
      text_help_content2: defaultText['text_help_content2'],
      text_help_content3: defaultText['text_help_content3'],
      text_help_content4: defaultText['text_help_content4'],
      text_help_content5: defaultText['text_help_content5'],
      text_help_content6: defaultText['text_help_content6'],
      text_about_title: defaultText['text_about_title'],
      text_about_content1: defaultText['text_about_content1'],
      text_about_content2: defaultText['text_about_content2'],
      text_about_content3: defaultText['text_about_content3'],
      text_about_content4: defaultText['text_about_content4'],
      text_about_content5: defaultText['text_about_content5'],
      text_about_content6: defaultText['text_about_content6']
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
    this.Settings = this.Settings.bind(this);
    this.importExportReminders = this.importExportReminders.bind(this);
    this.importRemindersReaderOnload = this.importRemindersReaderOnload.bind(this);
    this.importReminders = this.importReminders.bind(this);
    this.exportReminders = this.exportReminders.bind(this);
    this.updateLanguage = this.updateLanguage.bind(this);
    this.saveMessages = this.saveMessages.bind(this);
    this.remindersListRef = React.createRef();
  }

  saveMessages () {
    if (this.i18n.text) {
      this.setState({
          language: this.i18n.language,
          text_appname: this.i18n.text['text_appname'],
          text_add_label: this.i18n.text['text_add_label'],
          text_settings_label: this.i18n.text['text_settings_label'],
          text_importexport_label: this.i18n.text['text_importexport_label'],
          text_help_label: this.i18n.text['text_help_label'],
          text_about_label: this.i18n.text['text_about_label'],
          text_snack_mustbenum: this.i18n.text['text_snack_mustbenum'],
          text_snack_toobig: this.i18n.text['text_snack_toobig'],
          text_snack_toosmall: this.i18n.text['text_snack_toosmall'],
          text_settings_title: this.i18n.text['text_settings_title'],
          text_settings_content1: this.i18n.text['text_settings_content1'],
          text_language: this.i18n.text['text_language'],
          text_close_button: this.i18n.text['text_close_button'],
          text_importexport_title: this.i18n.text['text_importexport_title'],
          text_importexport_content: this.i18n.text['text_importexport_content'],
          text_back: this.i18n.text['text_back'],
          text_import: this.i18n.text['text_import'],
          text_export: this.i18n.text['text_export'],
          text_error_loadfile: this.i18n.text['text_error_loadfile'],
          text_error_fileformat: this.i18n.text['text_error_fileformat'],
          text_notifications1: this.i18n.text['text_notifications1'],
          text_notifications2: this.i18n.text['text_notifications2'],
          text_example_title: this.i18n.text['text_example_title'],
          text_example_content: this.i18n.text['text_example_content'],
          text_edit_title: this.i18n.text['text_edit_title'],
          text_edit_interval: this.i18n.text['text_edit_interval'],
          text_edit_body: this.i18n.text['text_edit_body'],
          text_edit_icon: this.i18n.text['text_edit_icon'],
          text_move_backward: this.i18n.text['text_move_backward'],
          text_move_forward: this.i18n.text['text_move_forward'],
          text_delete: this.i18n.text['text_delete'],
          text_help_title: this.i18n.text['text_help_title'],
          text_help_content1: this.i18n.text['text_help_content1'],
          text_help_content2: this.i18n.text['text_help_content2'],
          text_help_content3: this.i18n.text['text_help_content3'],
          text_help_content4: this.i18n.text['text_help_content4'],
          text_help_content5: this.i18n.text['text_help_content5'],
          text_help_content6: this.i18n.text['text_help_content6'],
          text_about_title: this.i18n.text['text_about_title'],
          text_about_content1: this.i18n.text['text_about_content1'],
          text_about_content2: this.i18n.text['text_about_content2'],
          text_about_content3: this.i18n.text['text_about_content3'],
          text_about_content4: this.i18n.text['text_about_content4'],
          text_about_content5: this.i18n.text['text_about_content5'],
          text_about_content6: this.i18n.text['text_about_content6']
      });
    } else {
      this.setState({
        language: 'en',
        text_appname: defaultText['text_appname'],
        text_add_label: defaultText['text_add_label'],
        text_settings_label: defaultText['text_settings_label'],
        text_importexport_label: defaultText['text_importexport_label'],
        text_help_label: defaultText['text_help_label'],
        text_about_label: defaultText['text_about_label'],
        text_snack_mustbenum: defaultText['text_snack_mustbenum'],
        text_snack_toobig: defaultText['text_snack_toobig'],
        text_snack_toosmall: defaultText['text_snack_toosmall'],
        text_settings_title: defaultText['text_settings_title'],
        text_settings_content1: defaultText['text_settings_content1'],
        text_language: defaultText['text_language'],
        text_close_button: defaultText['text_close_button'],
        text_importexport_title: defaultText['text_importexport_title'],
        text_importexport_content: defaultText['text_importexport_content'],
        text_back: defaultText['text_back'],
        text_import: defaultText['text_import'],
        text_export: defaultText['text_export'],
        text_error_loadfile: defaultText['text_error_loadfile'],
        text_error_fileformat: defaultText['text_error_fileformat'],
        text_notifications1: defaultText['text_notifications1'],
        text_notifications2: defaultText['text_notifications2'],
        text_example_title: defaultText['text_example_title'],
        text_example_content: defaultText['text_example_content'],
        text_edit_title: defaultText['text_edit_title'],
        text_edit_interval: defaultText['text_edit_interval'],
        text_edit_body: defaultText['text_edit_body'],
        text_edit_icon: defaultText['text_edit_icon'],
        text_move_backward: defaultText['text_move_backward'],
        text_move_forward: defaultText['text_move_forward'],
        text_delete: defaultText['text_delete'],
        text_help_title: defaultText['text_help_title'],
        text_help_content1: defaultText['text_help_content1'],
        text_help_content2: defaultText['text_help_content2'],
        text_help_content3: defaultText['text_help_content3'],
        text_help_content4: defaultText['text_help_content4'],
        text_help_content5: defaultText['text_help_content5'],
        text_help_content6: defaultText['text_help_content6'],
        text_about_title: defaultText['text_about_title'],
        text_about_content1: defaultText['text_about_content1'],
        text_about_content2: defaultText['text_about_content2'],
        text_about_content3: defaultText['text_about_content3'],
        text_about_content4: defaultText['text_about_content4'],
        text_about_content5: defaultText['text_about_content5'],
        text_about_content6: defaultText['text_about_content6']
      });
    }
  }

  componentDidMount() {
    // Localize the User Interface.
    this.i18n = new I18n(this.saveMessages);

    this.loadReminders();
  }

  componentWillUnmount() {

  }

  Settings() {
    const dialog = new MDCDialog(this.remindersListRef.current.querySelector('#settings'));
    dialog.open();
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
      title: this.state.text_example_title + ' ' + last.toString(),
      interval: "600",
      body: this.state.text_example_content +  ' ' + last.toString(),
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
    let missingFields = false;

    for (let i = 0; i < newReminders.length; i++) {
      if (newReminders[i].title === undefined
        || newReminders[i].interval === undefined
        || newReminders[i].body === undefined
        || newReminders[i].icon === undefined
        || newReminders[i].schedule === undefined
        || newReminders[i].visible === undefined)
        {
          missingFields = true;
          alert (this.state.text_error_fileformat);
          break;
        }
    }

    if (missingFields === false && newReminders.length > 0) {
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
        alert(this.state.text_error_loadfile);
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

  updateLanguage (event) {
    if (event.target.value) {
      this.i18n.change_language_translate_and_save_to_localStorage(event.target.value);
    }
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
            text_edit_title={this.state.text_edit_title}
            text_edit_interval={this.state.text_edit_interval}
            text_edit_body={this.state.text_edit_body}
            text_edit_icon={this.state.text_edit_icon}
            text_move_backward={this.state.text_move_backward}
            text_move_forward={this.state.text_move_forward}
            text_delete={this.state.text_delete}
          />);
      }
    }
    return (
      <div ref={this.remindersListRef} lang={this.state.language}>
        <TopAppBar>
          <TopAppBarRow>
            <TopAppBarSection align='start'>
              <TopAppBarTitle>{this.state.text_appname}</TopAppBarTitle>
            </TopAppBarSection>
            <TopAppBarSection align='end' role='toolbar'>
              <TopAppBarIcon actionItem tabIndex={0}>
                <MaterialIcon
                  aria-label={this.state.text_add_label}
                  hasRipple
                  icon='add'
                  onClick={() => this.addReminder()}
                />
              </TopAppBarIcon>
              <TopAppBarIcon actionItem tabIndex={0}>
                <MaterialIcon
                  aria-label={this.state.text_settings_label}
                  hasRipple
                  icon='settings'
                  onClick={() => this.Settings()}
                />
              </TopAppBarIcon>
              <TopAppBarIcon actionItem tabIndex={0}>
                <MaterialIcon
                  aria-label={this.state.text_importexport_label}
                  hasRipple
                  icon='import_export'
                  onClick={() => this.importExportReminders()}
                />
              </TopAppBarIcon>
              <TopAppBarIcon actionItem tabIndex={0}>
                <MaterialIcon
                  aria-label={this.state.text_help_label}
                  hasRipple
                  icon='help'
                  onClick={() => this.help()}
                />
              </TopAppBarIcon>
              <TopAppBarIcon actionItem tabIndex={0}>
                <MaterialIcon
                  aria-label={this.state.text_about_label}
                  hasRipple
                  icon='info'
                  onClick={() => this.about()}
                />
              </TopAppBarIcon>
            </TopAppBarSection>
          </TopAppBarRow>
        </TopAppBar>
        <TopAppBarFixedAdjust>

          <EnableNotifications text_notifications1={this.state.text_notifications1} text_notifications2={this.state.text_notifications2} />

          <section className="remindersSection">
            {remindersRepresentation}
          </section>

          <div className="mdc-snackbar" id="mustBeNum"><div className="mdc-snackbar__surface"><div className="mdc-snackbar__label" role="status" aria-live="polite">{this.state.text_snack_mustbenum}</div></div></div>
          <div className="mdc-snackbar" id="tooBig"><div className="mdc-snackbar__surface"><div className="mdc-snackbar__label" role="status" aria-live="polite">{this.state.text_snack_toobig}</div></div></div>
          <div className="mdc-snackbar" id="tooSmall"><div className="mdc-snackbar__surface"><div className="mdc-snackbar__label" role="status" aria-live="polite">{this.state.text_snack_toosmall}</div></div></div>

          <div className="mdc-dialog" role="alertdialog" aria-modal="true" aria-labelledby="my-dialog-title" aria-describedby="my-dialog-content" id="settings">
            <div className="mdc-dialog__container">
              <div className="mdc-dialog__surface">
                <h2 className="mdc-dialog__title" id="settings-dialog-title">{this.state.text_settings_title}</h2>
                <div className="mdc-dialog__content" id="settings-dialog-content">
                  <p>{this.state.text_settings_content1}</p>
                  <LanguageSelector text_language={this.state.text_language} language={this.state.language} handleSettingsChange={this.updateLanguage} />
                </div>
                <footer className="mdc-dialog__actions">
                  <button type="button" className="mdc-button mdc-dialog__button" data-mdc-dialog-action="yes">
                    <span className="mdc-button__label">{this.state.text_close_button}</span>
                  </button>
                </footer>
              </div>
            </div>
          </div>

          <div className="mdc-dialog" role="alertdialog" aria-modal="true" aria-labelledby="my-dialog-title" aria-describedby="my-dialog-content" id="impexp">
            <div className="mdc-dialog__container">
              <div className="mdc-dialog__surface">
                <h2 className="mdc-dialog__title" id="impexp-dialog-title">{this.state.text_importexport_title}</h2>
                <div className="mdc-dialog__content" id="impexp-dialog-content">
                  <p>{this.state.text_importexport_content}</p>
                </div>
                <footer className="mdc-dialog__actions">
                  <label>{this.state.text_import}&nbsp;<input type="file" onChange={e => this.importReminders(e)} className="mdc-button mdc-dialog__button" data-mdc-dialog-action="yes" /></label>
                  <input type="submit" value={this.state.text_back} className="mdc-button mdc-dialog__button" data-mdc-dialog-action="yes" />
                  <input type="submit" value={this.state.text_export} onClick={event => this.exportReminders()} className="mdc-button mdc-dialog__button" data-mdc-dialog-action="yes" />
                </footer>
              </div>
            </div>
          </div>

          <div className="mdc-dialog" role="alertdialog" aria-modal="true" aria-labelledby="my-dialog-title" aria-describedby="my-dialog-content" id="help">
            <div className="mdc-dialog__container">
              <div className="mdc-dialog__surface">
                <h2 className="mdc-dialog__title" id="help-dialog-title">{this.state.text_help_title}</h2>
                <div className="mdc-dialog__content" id="help-dialog-content">
                  <p>{this.state.text_help_content1}</p>
                  <p>{this.state.text_help_content2}</p>
                  <p>{this.state.text_help_content3}</p>
                  <p>{this.state.text_help_content4}</p>
                  <p>{this.state.text_help_content5}</p>
                  <p>{this.state.text_help_content6}</p>
                </div>
                <footer className="mdc-dialog__actions">
                  <button type="button" className="mdc-button mdc-dialog__button" data-mdc-dialog-action="yes">
                    <span className="mdc-button__label">{this.state.text_close_button}</span>
                  </button>
                </footer>
              </div>
            </div>
            <div className="mdc-dialog__scrim"></div>
          </div>

          <div className="mdc-dialog" role="alertdialog" aria-modal="true" aria-labelledby="my-dialog-title" aria-describedby="my-dialog-content" id="about">
            <div className="mdc-dialog__container">
              <div className="mdc-dialog__surface">
                <h2 className="mdc-dialog__title" id="about-dialog-title">{this.state.text_about_title}</h2>
                <div className="mdc-dialog__content" id="about-dialog-content">
                  <p>{this.state.text_about_content1}
                      <br />{this.state.text_about_content2}</p>
                  <p>{this.state.text_about_content3}</p>
                  <p>{this.state.text_about_content4}</p>
                  <p>{this.state.text_about_content5}</p>
                  <p>{this.state.text_about_content6}</p>
                </div>
                <footer className="mdc-dialog__actions">
                  <button type="button" className="mdc-button mdc-dialog__button" data-mdc-dialog-action="yes">
                    <span className="mdc-button__label">{this.state.text_close_button}</span>
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