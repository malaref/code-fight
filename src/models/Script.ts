import { Column, Entity, getConnection, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User";
import { Privilege } from "./Privilege";
import fs from "fs";
import { applyPatch } from "diff";
import { exec } from "child_process";

@Entity()
export class Script {

    private static BASE_DIR: string = "./dist/scripts/";

    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @OneToMany(type => Privilege, privilege => privilege.script)
    privileges!: Privilege[];

    constructor(name: string) {
        if (name  != undefined) {
            this.name = name;
        }
    }

    public addPrivilege (privilege: Privilege) {
        if (this.privileges == undefined) {
            this.privileges = [];
        }
        this.privileges.push(privilege);
    }

    /*
     * @return Script if it exists else undefined
     */
    static async getScript (scriptId: number) {
        const scriptRepo = getConnection().getRepository(Script);
        return await scriptRepo.findOne(scriptId);
    }

    /*
     * @description this function add or edit user's privileges
     * @return bool the status of the operation
     */
    public async addUserToScript(ownerUsername: string, newUsername: string, newContributionLevel: string) {
        const owner: User | undefined = await User.getUser(ownerUsername);
        const newUser: User | undefined = await User.getUser(newUsername);
        if (owner == undefined || newUser == undefined) {
            return false;
        }
        const ownerPrivilege: Privilege | undefined = await Privilege.getPrivilege(ownerUsername, this.id);
        if (ownerPrivilege == undefined) {
            return false;
        }
        if (Privilege.OWNER != ownerPrivilege.contributionLevel) {
            return false;
        }
        const UserPrivilege: Privilege | undefined = await Privilege.getPrivilege(newUsername, this.id);
        if (UserPrivilege == undefined) {
            const newUserPrivilege: Privilege = await new Privilege(newUser, this, newContributionLevel);
            await getConnection().getRepository(Privilege).save(newUserPrivilege);
            await this.addPrivilege(newUserPrivilege);
            await newUser.addPrivilege(newUserPrivilege);
        } else {
            UserPrivilege.contributionLevel = newContributionLevel;
            await getConnection().getRepository(Privilege).save(UserPrivilege);
        }
        return true;
    }

    /*
     *@return boolean the status of the operation
     */
    public async applyPatch (patch: string) {
        const path: string = Script.BASE_DIR + this.id.toString(10);
        if (!fs.existsSync(path)) {
            return false;
        }
        const text: string = fs.readFileSync(path).toString();
        const patchedText: string = applyPatch(text, patch);
        fs.writeFile(path, patchedText, (err) => {
            if (err) {
                console.error("error writing the file", err);
            }
        });
        return true;
    }

    public createScriptStructure() {
        const helloWorld: string = "console.log(\"Hello " + this.name + "\")";
        const path: string = Script.BASE_DIR + this.id.toString(10);
        if (!fs.existsSync(Script.BASE_DIR)) {
            fs.mkdirSync(Script.BASE_DIR);
        }
        fs.writeFile(path, helloWorld, (err) => {
            if (err) {
                console.error("error writing the file", err);
            }
        });
    }

    // TODO run script
    public runScript(inputStream: string) {
        const path = Script.BASE_DIR + this.id.toString(10);
        console.log("trying to run the code");
        exec("echo " + inputStream + " | node " + path , (err, stdout, stderr) => {
            if (err) {
                console.error("there is error here", err);
            }
            console.log(stdout);
            console.log(stderr);
        });
    }

    /*
     *@return the golden file of the project
     */
    public getScriptCode(): string {
        return fs.readFileSync(Script.BASE_DIR + this.id.toString(10)).toString();
    }
}