import { createServer }
    from "./server.js";
import { Server }
    from "http";
try {
    const server: Server = createServer();
} catch (error: unknown) {
    if (error instanceof Error) {
        console.error(
            `Error starting the server: ${error.message}\n ${error.stack}`
        );
    } else {
        console.error(
            `An unexpected error occurred: ${error}`
        );
    }
}
