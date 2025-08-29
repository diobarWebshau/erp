import { createApp } from "./app.js";
import { Express } from "express";
import { Server } from "http";

const createServer = (): Server => {
    const app: Express = createApp();
    const port = process.env.PORT || 3000;
    const server = app.listen(port, () => {
        const address = server.address();
        if (typeof address === "string") {
            console.log(
                `Server listening on ${address}`
            );
        } else if (address && typeof address === "object") {
            console.log(
                `Server listening on the port ${address.port}`
            )
        }
    })
    return server;
}

export { createServer }