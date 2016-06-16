let gcal = require("./gcal.js");
let express = require("express");
let Promise = require("bluebird");
let crypto = require("crypto");

let dbCalendars = require('./agendas.json');

let app = express();
let subApp = express.Router();

subApp.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

subApp.get('/', (req, res) => {

    let calendars = Object.keys(dbCalendars).map(key => { return { name: key, color: generateColor(key) } });

    return res.json(calendars);
});

subApp.get('/events', (req, res) => {

    let params = req.query;

    return listEvents(params, res);
});

function listEvents(params, res) {
    let calendars = getCalendarsParameter(params.calendars);

    let promises = calendars.map(calendar => {

        let cal = dbCalendars[calendar];
        return gcal.listEvents(cal.key, cal.calendarId, params);
    });

    Promise.all(promises).then(events => {

        eventsReady = events.map(normalizeCalendar);
        return res.json(eventsReady);

    }).catch(err => {

        console.log(err);
        return res.send({ erro: err.message });
    });
}

function getCalendarsParameter(calendarsParam) {
    if (!Array.isArray(calendarsParam)) {
        calendars = [calendarsParam];
    }
    else {
        calendars = calendarsParam;
    }

    // Remove duplicates
    return Array.from(new Set(calendars));
}

function normalizeCalendar(calendar) {
    let normalizedCalendar = new Object();

    normalizedCalendar.color = generateColor(calendar.summary);
    normalizedCalendar.summary = calendar.summary;
    normalizedCalendar.etag = calendar.etag;

    normalizedCalendar.items = calendar.items.map(event => {
        let normalizedEvent = new Object();
        normalizedEvent.color = normalizedCalendar.color;
        normalizedEvent.start = event.start;
        normalizedEvent.end = event.end;
        normalizedEvent.summary = event.summary;
        normalizedEvent.id = event.id;
        normalizedEvent.htmlLink = event.htmlLink;

        return normalizedEvent;
    });

    return normalizedCalendar;
}

function generateColor(nome) {
    let md5sum = crypto.createHash('md5');

    md5sum.update(nome, 'utf8', 'hex');
    let cor = md5sum.digest('hex');

    return "#" + cor.substring(0, 6);
}

let path = process.env.REQUEST_PATH ? process.env.REQUEST_PATH : '';
app.use(path, subApp);

// Launch server
app.listen(4242);
