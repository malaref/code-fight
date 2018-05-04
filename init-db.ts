import { createConnection } from "typeorm";

const Privilege = require("./dist/models/Privilege").Privilege;
const Script = require("./dist/models/Script").Script;
const User = require("./dist/models/User").User;

createConnection().then(async (connection) => {
    const user1 = await User.createNewUser("user1", "12345");
    const user2 = await User.createNewUser("user2", "12345");
    const user3 = await User.createNewUser("user3", "12345");
    const user4 = await User.createNewUser("user4", "12345");
    await User.createNewUser("user5", "12345");

    const script1u1 = await user1.createNewScript("script1u1");
    const script2u1 = await user1.createNewScript("script2u2");
    const script3u1 = await user1.createNewScript("script3u3");

    const script1u2 = await user2.createNewScript("script1u2");
    const script2u2 = await user2.createNewScript("script2u2");

    await script1u1.addUserToScript(user1.username, user3.username, Privilege.CONTRIBUTOR);
    await script1u1.addUserToScript(user3.username, user3.username, Privilege.CONTRIBUTOR);
    console.log("Finished seeding successfully");
    console.log("user1", await user1.getUserScripts());
    console.log("user3", await user3.getUserScripts());
    console.log("user4", await user4.getUserScripts());

    console.log("access of user1 and pro1", await user1.getUserScript(1));
    console.log("access of user1 and pro4", await user1.getUserScript(4));
}).catch((err) => console.log(err));
