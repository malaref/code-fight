const Privilege = require("./dist/models/Privilege").Privilege;
const Script = require("./dist/models/Script").Script;
const User = require("./dist/models/User").User;
import { Connection, createConnection } from "typeorm";

export let DB: Connection;
createConnection().then(async connection => {
    DB = connection;
    console.log("connected successfully");
    const user1 = await User.createNewUser("user1", "12345");
    const user2 = await User.createNewUser("user2", "123456");
    const user3 = await User.createNewUser("user3", "1234567");
    const user4 = await User.createNewUser("user4", "12345678");
    const user5 = await User.createNewUser("user5", "12345");
    const user6 = await User.createNewUser("user6", "12345678");
    const user7 = await User.createNewUser("user7", "12345678");

    const script1u1 = await user1.createNewScript("script1u1");
    const script2u1 = await user1.createNewScript("script2u2");
    const script3u1 = await user1.createNewScript("script3u3");

    const script1u2 = await user2.createNewScript("script1u2");
    const script2u2 = await user2.createNewScript("script2u2");

    const script1u3 = await user3.createNewScript("script1u3");
    const script2u3 = await user3.createNewScript("script2u3");

    await script1u1.addUserToScript(user1.username, user3.username, Privilege.CONTRIBUTOR);
    await script1u1.addUserToScript(user1.username, user2.username, Privilege.VIEWER);
    await script1u1.addUserToScript(user1.username, user5.username, Privilege.CONTRIBUTOR);

    await script1u2.addUserToScript(user2.username, user5.username, Privilege.VIEWER);
    await script1u2.addUserToScript(user2.username, user6.username, Privilege.VIEWER);
    await script1u2.addUserToScript(user2.username, user1.username, Privilege.CONTRIBUTOR);
    console.log("Finished seeding successfully");
}).catch((err) => console.log(err));
