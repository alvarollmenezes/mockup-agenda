module.exports = {
    apiKey: process.env.API_KEY || 'google-key',
    colors: JSON.parse( process.env.COLORS ) || [ '#8E2E11', '#280C54', '#004766', '#456600', '#966900' ]
};
