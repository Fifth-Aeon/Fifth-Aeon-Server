let json: ServerConfig;
try {
    json = require("../config.json");
} catch (e) {
    console.log("No JSON config file found. Using enviroment variables.");
    json = {
        connectionString: null,
        jwtSecret: null,
        sendgridAPIKey: null
    };
}

interface ServerConfig {
    connectionString: string | null;
    jwtSecret: string | null;
    sendgridAPIKey: string | null;
}

export const config = {
    connectionString: json.connectionString || process.env.DATABASE_URL,
    jwtSecret: json.jwtSecret || process.env.JWT_SECRET || "TestSecret",
    sendgridAPIKey: json.sendgridAPIKey || process.env.SENDGRID_API_KEY
} as ServerConfig;

if (config.jwtSecret === "TestSecret")
    console.warn(
        "No JWT_SECRET enviroment variable found. Using test secret. Do not use this in production."
    );
