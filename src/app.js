const config = require("./config.js");
const gcal = require("./gcal.js");
const express = require("express");
const Promise = require("bluebird");
const crypto = require("crypto");
const apicache = require('apicache').options({ debug: false }).middleware;
const dbCalendars = require('./agendas.json');
const apiMiddleware = require( 'node-mw-api-prodest' ).middleware;

let app = express();

let subApp = express();

app.use( apiMiddleware( {
    compress: true,
    cors: true,
    log: true
} ) );

subApp.get('/', (req, res) => {

    let calendars = Object.keys(dbCalendars)
        .map( (k, i) => { return { name: k, color: config.colors[i] } })
        .sort();

    return res.json(calendars);
});

subApp.get('/events', apicache('60 minutes'), (req, res) => {

    let params = req.query;

    return listEvents(params, res, normalizeCalendar)
    .then(events => {
        return res.json(events)
    });
});

subApp.get('/events/goves', apicache('60 minutes'), (req, res) => {

    let params = req.query;
    const maxResults = params.maxResults;
    req.maxResults = null; //TODO: multiplicar pelo numero de agendas

    return listEvents(params, res, normalizeCalendarGovES)
    .then(events => {
        events = events.reduce((previous, current) => {
            return previous.concat(current);
        }, [])
        .sort((a,b) => {
            const aStart = a.start.dateTime || a.start.date;
            const aEnd = a.end.dateTime || a.end.date;
            const bStart = b.start.dateTime || b.start.date;
            const bEnd = b.end.dateTime || b.end.date;

            return aStart.localeCompare(bStart) || aEnd.localeCompare(bEnd);
        })
        .slice(0, maxResults);

        res.json(events);
    });
});

function listEvents(params, res, normalization) {
    let calendars = getCalendarsParameter(params.calendars);

    let promises = calendars.map(calendar => {

        let cal = dbCalendars[calendar];
        return gcal.listEvents(cal.calendarId, params);
    });

    return Promise.all(promises)
    .then(events => {

        return events.map(normalization);
    })
    .catch(err => {

        console.log(err);
        return res.send(err);
    });
}

function getCalendarsParameter(calendarsParam) {
    if (!calendarsParam) {
        calendars = [];
    }
    else if (!Array.isArray(calendarsParam)) {
        calendars = [calendarsParam];
    }
    else {
        calendars = calendarsParam;
    }

    // Remove duplicates
    return Array.from(new Set(calendars));
}

function normalizeCalendarGovES(calendar) {
    return calendar.items;
}

function normalizeCalendar(calendar, index) {
    let normalizedCalendar = new Object();

    normalizedCalendar.color = config.colors[index];
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

let path = process.env.REQUEST_PATH || '';
app.use(path, subApp);

// Launch server
app.listen(4242);

console.log( 'Listening on port 4242' );
