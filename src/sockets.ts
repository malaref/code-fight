import socketIo from "socket.io";
import { Server } from "http";


export default function sockets(server: Server) {
    const io = socketIo(server);
    io.on("connect", (socket: socketIo.Socket) => {
        // TODO Authenticate the connection
        console.log("Client connected");
        socket.on("chat", (message) => {
            console.log("Message received: %s", message);
            io.emit("chat", message);
        });
        socket.on("change", (patch: string) => {
            console.log(patch);
            io.emit("change", patch);
        });
        socket.on("disconnect", () => {
            console.log("Client disconnected");
        });
    });
}
