let json: ServerConfig;
try {
    json = require('../config.json');
} catch (e) {
    console.log('No JSON config file found. Using enviroment variables.');
    json = {
        database: {
            user: null,
            database: null,
            password: null
        },
        jwtSecret: null,
        sendgridAPIKey: null
    }
}

interface ServerConfig {
    database: {
        user: string,
        database: string,
        password: string
    },
    jwtSecret: string,
    sendgridAPIKey: string
}

export const config = {
    database: {
        user: json.database.user || process.env.SQL_USER || 'postgres',
        database: json.database.database || process.env.SQL_DATABASE || 'ccg',
        password: json.database.password || process.env.SQL_PASSWORD || 'postgres'
    },
    jwtSecret: json.jwtSecret || process.env.JWT_SECRET || 'TestSecret',
    sendgridAPIKey: json.sendgridAPIKey || process.env.SENDGRID_API_KEY
} as ServerConfig

if (config.jwtSecret === 'TestSecret')
    console.warn('No JWT_SECRET enviroment variable found. Using test secret. Do not use this in production.');