require("make-promises-safe");
import { Server } from "./server";

const port = parseInt(process.env.PORT || "", 10) || 2222;

console.log("Starting Server on port", port);
const server = new Server(port);
