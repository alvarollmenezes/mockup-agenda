module.exports = {
    env: process.env.NODE_ENV || '',
    port: process.env.PORT || '4242',
    path: process.env.REQUEST_PATH || '/calendars',
    TZ: process.env.TZ || 'America/Sao_Paulo',
    production: process.env.PRODUCTION || false
};
