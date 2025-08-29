import { createServer } from "./server.js";
try {
    const server = createServer();
}
catch (error) {
    if (error instanceof Error) {
        console.error(`Error starting the server: ${error.message}\n ${error.stack}`);
    }
    else {
        console.error(`An unexpected error occurred: ${error}`);
    }
}
