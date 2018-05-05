import socketIo from "socket.io";
import { Server } from "http";


export default function sockets(server: Server) {
    const io = socketIo(server);
    io.on("connect", (socket: socketIo.Socket) => {
        // TODO Authenticate the connection
        socket.on("room", (room) => {
            socket.join(room);
            (<any>socket).room = room;
        });
        socket.on("chat", (message) => {
            io.to((<any>socket).room).emit("chat", message);
        });
        socket.on("change", (patch: string) => {
            io.to((<any>socket).room).emit("change", patch);
        });
    });
}
