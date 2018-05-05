import socketIo from "socket.io";
import { Server } from "http";
import { Script } from "./models/Script";


export default function sockets(server: Server) {
    const io = socketIo(server);
    io.on("connect", (socket: socketIo.Socket) => {
        // TODO Authenticate the connection
        socket.on("script_id", (script_id) => {
            socket.join(script_id);
            (<any>socket).script_id = script_id;
        });
        socket.on("chat", (message) => {
            io.to((<any>socket).script_id).emit("chat", message);
        });
        socket.on("change", (patch: string) => {
            Script.getScript((<any>socket).script_id)
                .then((script) => {
                    if (script != undefined) {
                        script.applyPatch(patch).catch((err) => console.log(err));
                    }
                }).catch((err) => console.log(err));
            io.to((<any>socket).script_id).emit("change", patch);
        });
    });
}
