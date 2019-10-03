let database;

const functionCalledEvery1Min = () => {
	// set interval,
};

const computeMinutesAway = () => {};

const calculateTime = (frequency) => {
	const startTime = $('#input-time').val();
	const startTimeConverted = moment(startTime, 'HH:mm').subtract(1, 'years');
	const timeDiff = moment().diff(moment(startTimeConverted), 'minutes');
	const minAway = frequency - (timeDiff % frequency);
	const nextArrival = moment().add(minAway, 'minutes');
	const nextArrivalConverted = moment(nextArrival).format('hh:mm');
	return { startTime, nextArrivalConverted, minAway };
};

const pushSchedule = (db, trainRecord) => {
	db.ref().push({
		name: trainRecord.name,
		destination: trainRecord.destination,
		frequency: trainRecord.frequency,
		nextArrival: trainRecord.nextArrival,
		minAway: trainRecord.minAway,
		startTime: trainRecord.startTime,
		dateAdded: firebase.database.ServerValue.TIMESTAMP
	}),
		(err) => {
			console.log('Error adding to database', err.code);
		};
};

const onSubmit = (event) => {
	event.preventDefault();

	const name = $('#input-name')
		.val()
		.trim();

	const destination = $('#input-destination')
		.val()
		.trim();

	const frequency = parseInt($('#input-frequency').val());

	const time = calculateTime(frequency);

	const trainRecord = createTrainRecordObj(
		name,
		destination,
		frequency,
		time.nextArrivalConverted,
		time.minAway,
		time.startTime
	);

	pushSchedule(database, trainRecord);
};

const createTrainRecordObj = (
	name,
	destination,
	frequency,
	nextArrival,
	minAway,
	startTime
) => {
	const obj = {
		name: name,
		destination: destination,
		frequency: frequency,
		nextArrival: nextArrival,
		minAway: minAway,
		startTime: startTime
	};
	return obj;
};

const renderSchedule = (trainRecord) => {
	const tr = $('<tr>');
	const thName = $('<th>', { scope: 'col' }).text(trainRecord.name);
	const thDest = $('<th>', { scope: 'col' }).text(trainRecord.destination);
	const thFreq = $('<th>', { scope: 'col' }).text(trainRecord.frequency);
	const thArrival = $('<th>', { scope: 'col' }).text(trainRecord.nextArrival);
	const thTime = $('<th>', { scope: 'col' }).text(trainRecord.minAway);

	tr.append(thName, thDest, thFreq, thArrival, thTime);
	$('#tbody').append(tr);
};

const getSchedule = (db) => {
	db.ref().on(
		'child_added',
		(snapshot) => {
			renderSchedule(
				createTrainRecordObj(
					snapshot.val().name,
					snapshot.val().destination,
					snapshot.val().frequency,
					snapshot.val().nextArrival,
					snapshot.val().minAway,
					snapshot.val().startTime
				)
			);
		},
		(err) => {
			console.log('Error reading from database: ', err.code);
		}
	);
};

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
	database = initializeFirebase();
	getSchedule(database);
	$('#submit-button').click(onSubmit);

	console.log(document.getElementById('tbody').children);
};
