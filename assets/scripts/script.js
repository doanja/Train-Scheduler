const updateSchedule = trainRecord => {
  console.log('trainRecord :', trainRecord);
  const tr = $('<tr>');
  const thName = $('<th>', { scope: 'col' }).text(trainRecord.name);
  const thDest = $('<th>', { scope: 'col' }).text(trainRecord.destination);
  const thTime = $('<th>', { scope: 'col' }).text(trainRecord.time);
  const thArrival = $('<th>', { scope: 'col' }).text('00:00 AM');
  const thFreq = $('<th>', { scope: 'col' }).text(trainRecord.frequency);
  // update next arrival too?

  tr.append(thName, thDest, thFreq, thArrival, thTime);
  $('#tbody').append(tr);
};

const createTrainRecordObj = (name, destination, time, frequency) => {
  const obj = {
    name: name,
    destination: destination,
    time: time,
    frequency: frequency
  };
  return obj;
};

const onSubmit = event => {
  event.preventDefault();

  const name = $('#input-name')
    .val()
    .trim();
  //   console.log('name :', name);

  const destination = $('#input-destination')
    .val()
    .trim();
  //   console.log('destination :', destination);

  const time = parseInt(
    $('#input-time')
      .val()
      .trim()
  );
  //   console.log('time :', time);

  const frequency = parseInt(
    $('#input-frequency')
      .val()
      .trim()
  );
  //   console.log('frequency :', frequency);

  //   const a = createTrainRecordObj(name, destination, time, frequency);
  //   console.log('a :', a);
  updateSchedule(createTrainRecordObj(name, destination, time, frequency));
};

$('#submit-button').click(onsubmit);

const initializeFirebase = (key = FIREBASE_API_KEY) => {
  var config = {
    apiKey: key,
    authDomain: 'monday-9-30-19.firebaseapp.com',
    databaseURL: 'https://monday-9-30-19.firebaseio.com',
    storageBucket: 'monday-9-30-19.appspot.com'
  };

  firebase.initializeApp(config);
  return firebase.database();
};

window.onload = () => {
  // run something
  $('#submit-button').click(onSubmit);
};
