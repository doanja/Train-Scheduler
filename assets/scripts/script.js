let database; // the database object

/**
 * function to update the train schedule
 * @param {object} e the event to be listen to
 */
const onSubmitModal = e => {
  e.preventDefault();

  const id = $('#train-id').text();

  // check for empty input
  if (!$('.input-m').val()) {
    alert('You must complete the form to submit.');
  }

  // update the database based on the id
  else {
    firebase
      .database()
      .ref()
      .child(id) // id of the train data
      .set({
        // send input to the database
        name: $('#input-name-m').val(),
        destination: $('#input-destination-m').val(),
        startTime: $('#input-time-m').val(),
        frequency: parseInt($('#input-frequency-m').val())
      })
      .then(() => {
        console.log('Update succeeded.');
        updateRenderedTimes(database);
      })
      .catch(err => {
        console.log('Update failed: ' + err.message);
      });
  }
};

/**
 * function to clear inputs
 */
const clearForm = () => {
  $('input').val('');
};

/**
 * function to push the train schedule to the database
 * @param {object} db the database
 * @param {object} trainRecord the object containing information about the train
 */
const pushSchedule = (db, trainRecord) => {
  db.ref().push({
    name: trainRecord.name,
    destination: trainRecord.destination,
    startTime: trainRecord.startTime,
    frequency: trainRecord.frequency
  }),
    err => {
      console.log('Error adding to database', err.code);
    };
};

/**
 * function to grab input from the form, add to the database, and update the train schedule
 * @param {object} e the event to be listen to
 */
const onSubmit = e => {
  e.preventDefault();

  // check for empty input
  if (!$('input').val()) {
    alert('You must complete the form to submit.');
  }
  //grab input from the form and push it to the database
  else {
    const name = $('#input-name')
      .val()
      .trim();

    const destination = $('#input-destination')
      .val()
      .trim();

    const frequency = parseInt($('#input-frequency').val());

    const startTime = $('#input-time').val();

    // create a new trainRecord object to pass to pushSchedule()
    const trainRecord = createTrainRecord(
      name,
      destination,
      startTime,
      frequency
    );

    pushSchedule(database, trainRecord);
    updateRenderedTimes(database);
    clearForm();
  }
};

/**
 * function to clear the train schedule and re-render the schedule with updated times
 * @param {string} db the database
 */
const updateRenderedTimes = db => {
  $('#tbody').empty();
  getSchedule(db);
};

/**
 * function to calculate the next arrival time and minutes away
 * @param {string} startTime the time the train starts
 * @param {integer} frequency the time the train takes before its next arrival
 */
const calculateTime = (startTime, frequency) => {
  const startTimeConverted = moment(startTime, 'HH:mm').subtract(1, 'years');
  const timeDiff = moment().diff(moment(startTimeConverted), 'minutes');
  const minAway = frequency - (timeDiff % frequency);
  const nextArrival = moment().add(minAway, 'minutes');
  const nextArrivalConverted = moment(nextArrival).format('hh:mm');
  return { nextArrivalConverted, minAway };
};

/**
 *
 * @param {string} name the name of the train
 * @param {string} destination the name of the destintation
 * @param {string} startTime the time the train starts
 * @param {integer} frequency the time the train takes before its next arrival
 */
const createTrainRecord = (name, destination, startTime, frequency) => {
  return {
    name: name,
    destination: destination,
    startTime: startTime,
    frequency: frequency
  };
};

/**
 * function to show the modal when edit is clicked
 * @param {string} id the id of the data in the database
 * @param {object} trainRecord the object containing the name, destination, frequency and start time
 */
const onEdit = (id, trainRecord) => {
  $('#edit' + id).click(() => {
    // set the modal title
    $('.modal-title').text('Update ' + trainRecord.name);

    // store the train id on hidden element on the modal
    $('#train-id').text(id);

    // set the modal values
    $('#input-name-m').val(trainRecord.name);
    $('#input-destination-m').val(trainRecord.destination);
    $('#input-time-m').val(trainRecord.startTime);
    $('#input-frequency-m').val(trainRecord.frequency);
  });
};

/**
 * function to delete the train data from the database using the id
 * @param {string} id the id of the data in the database
 */
const onDelete = id => {
  $('#del' + id).click(() => {
    firebase
      .database()
      .ref(id)
      .remove()
      .then(() => {
        console.log('Remove succeeded.');
        updateRenderedTimes(database);
      })
      .catch(err => {
        console.log('Remove failed: ' + err.message);
      });
  });
};

/**
 * function to render the train schedule
 * @param {object} trainRecord the object containing the name, destination, frequency and start time
 * @param {object} time the object containing the minutes and next arrival time
 */
const renderSchedule = (trainRecord, time, id) => {
  // create the elements
  const tr = $('<tr>');
  const thName = $('<th>', { scope: 'col' }).text(trainRecord.name);
  const thDest = $('<th>', { scope: 'col' }).text(trainRecord.destination);
  const thFreq = $('<th>', { scope: 'col' }).text(trainRecord.frequency);
  const thArrival = $('<th>', { scope: 'col' }).text(time.nextArrivalConverted);
  const thMinAway = $('<th>', { scope: 'col' }).text(time.minAway);
  const thBtn = $('<th>', { scope: 'col' });

  // create the button elements
  const btnEdit = $('<button>', {
    class: 'btn btn-primary m-1  px-3',
    id: 'edit' + id,
    'data-toggle': 'modal',
    'data-target': '#train-modal'
  }).text('Edit');
  const btnDel = $('<button>', {
    class: 'btn btn-danger m-1  px-3',
    id: 'del' + id
  }).text('Del');

  // append the elements to the html
  thBtn.append(btnEdit, btnDel);
  tr.append(thName, thDest, thFreq, thArrival, thMinAway, thBtn);
  $('#tbody').append(tr);

  // attach click listeners to the buttons
  onDelete(id);
  onEdit(id, trainRecord);
};

/**
 * function to render the train schedule from the database everytime the database gets updated
 * @param {string} db the database
 */
const getSchedule = db => {
  db.ref().on(
    'child_added',
    snapshot => {
      renderSchedule(
        createTrainRecord(
          snapshot.val().name,
          snapshot.val().destination,
          snapshot.val().startTime,
          snapshot.val().frequency
        ),
        calculateTime(snapshot.val().startTime, snapshot.val().frequency),
        snapshot.key
      );
    },
    err => {
      console.log('Error reading from database: ', err.code);
    }
  );
};

/**
 * function to initialize the firebase
 * @param {string} key the api key used to access the database
 */
const initializeFirebase = (key = FIREBASE_API_KEY) => {
  var firebaseConfig = {
    apiKey: key,
    authDomain: 'train-scheduler-bb190.firebaseapp.com',
    databaseURL: 'https://train-scheduler-bb190.firebaseio.com',
    storageBucket: 'train-scheduler-bb190.appspot.com'
  };

  firebase.initializeApp(firebaseConfig);
  return firebase.database();
};

window.onload = () => {
  // set the database
  database = initializeFirebase();

  // pull schedule from the database
  getSchedule(database);

  // updates train times every minute
  setInterval(() => {
    updateRenderedTimes(database);
  }, 10000);

  // submit button listener
  $('#submit-button').click(onSubmit);

  // submit button modal listener
  $('#submit-button-m').click(onSubmitModal);
};
