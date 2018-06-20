const Promise = require( 'bluebird' );
const crypto = require( "crypto" );
const _ = require( 'lodash' );
const moment = require( 'moment' );
const calendarConfig = require( '../config/calendar.js' );
const gcal = require( './googleCalendar.service.js' )();
const dbCalendars = require( '../agendas.json' );

module.exports = () => {

    listEvents = ( params, normalizer ) => {
        let calendars = getCalendarsParameter( params.calendars );

        let promises = calendars.map( calendar => {
            let cal = dbCalendars[ calendar ];
            return gcal.listEvents( cal.calendarId, params );
        } );

        return Promise.all( promises )
            .then( events => _.flatten( events.map( normalizer ) ) );
    }

    getCalendarsParameter = ( calendarsParam ) => {
        if ( !calendarsParam ) {
            calendars = [];
        }
        else if ( !Array.isArray( calendarsParam ) ) {
            calendars = [ calendarsParam ];
        }
        else {
            calendars = calendarsParam;
        }

        // Remove duplicates
        return Array.from( new Set( calendars ) );
    }

    normalizeCalendarGovES = ( calendar ) => calendar.items;

    normalizeCalendar = ( calendar, index ) => ( {
        color: calendarConfig.colors[ index ],
        summary: calendar.summary,
        etag: calendar.etag,
        items: calendar.items.map( event => ( {
            color: calendarConfig.colors[ index ],
            start: event.start,
            end: event.end,
            summary: event.summary,
            id: event.id,
            htmlLink: event.htmlLink
        } ) )
    } );

    normalizeCalendar2 = ( calendar, index ) =>
        calendar.items.map( event => {
            const newEvent = {
                calendar: calendar.summary,
                etag: calendar.etag,
                color: calendarConfig.colors[ index ],
                startTime: event.start.date ? event.start.date : event.start.dateTime,
                allDay: event.start.date ? true : false,
                endTime: event.end.date ? event.end.date : event.end.dateTime,
                title: event.summary,
                htmlLink: event.htmlLink
            }

            newEvent.sameDay = sameDate( new Date( newEvent.startTime ), new Date( newEvent.endTime ) );

            return newEvent;
        } );


    sameDate = ( startDate, endDate ) => {
        return startDate.getFullYear() === endDate.getFullYear()
            && startDate.getMonth() === endDate.getMonth()
            && startDate.getDate() === endDate.getDate();
    }

    generateColor: ( nome ) => {
        let md5sum = crypto.createHash( 'md5' );

        md5sum.update( nome, 'utf8', 'hex' );
        let cor = md5sum.digest( 'hex' );

        return "#" + cor.substring( 0, 6 );
    }

    let calendarService = new Object();

    calendarService.getAvailableCalendars = () => {
        return Object.keys( dbCalendars )
            .map( ( k, i ) => { return { name: k, color: calendarConfig.colors[ i ] } } )
            .sort();
    }

    calendarService.getEvents = ( params ) => listEvents( params, normalizeCalendar );

    calendarService.getEvents2 = ( params ) => listEvents( params, normalizeCalendar2 );

    calendarService.getGovEsEvents = ( query, maxResults ) => {
        return listEvents( query, normalizeCalendarGovES )
            .then( events =>
                events
                    .reduce( ( previous, current ) => previous.concat( current ), [] )
                    .sort( ( a, b ) => {
                        const aStart = a.start.dateTime || a.start.date;
                        const aEnd = a.end.dateTime || a.end.date;
                        const bStart = b.start.dateTime || b.start.date;
                        const bEnd = b.end.dateTime || b.end.date;

                        return aStart.localeCompare( bStart ) || aEnd.localeCompare( bEnd );
                    } )
                    .slice( 0, maxResults )
            );
    }

    return calendarService;
};
