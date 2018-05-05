import { Column, Entity, getConnection, PrimaryGeneratedColumn, Repository } from "typeorm";
import { User } from "./User";
import { Privilege } from "./Privilege";
import fs from "fs";
import JsDiff from "diff";
import { execSync } from "child_process";

@Entity()
export class Script {

    private static BASE_DIR: string = "./dist/scripts/";

    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    constructor(name: string) {
        if (name  != undefined) {
            this.name = name;
        }
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
        const path: string = Script.BASE_DIR + this.id.toString();
        if (!fs.existsSync(path)) {
            return false;
        }
        const text: string = fs.readFileSync(path).toString();
        const patchedText: string = JsDiff.applyPatch(text, patch);
        fs.writeFile(path, patchedText, (err) => {
            if (err) {
                console.error("error writing the file", err);
            }
        });
        return true;
    }

    public createScriptStructure() {
        const helloWorld: string = "console.log(\"Hello " + this.name + "\")";
        const path: string = Script.BASE_DIR + this.id.toString();
        if (!fs.existsSync(Script.BASE_DIR)) {
            fs.mkdirSync(Script.BASE_DIR);
        }
        fs.writeFile(path, helloWorld, (err) => {
            if (err) {
                console.error("error writing the file", err);
            }
        });
    }

    /*
     *@return the stdout in a string if running successfully else undefined
     *@params DO NOT use "" as an input use " " if there is no input
     */
    public runScript(inputStream: string): string|undefined {
        const path = Script.BASE_DIR + this.id.toString();
        if (fs.existsSync(path)) {
            console.log("trying to run the code");
            const result: string = execSync("node " + path, {input: inputStream}).toString();
            return result;
        }
    }

    /*
     *@return the golden file of the project
     */
    public getScriptCode(): string {
        return fs.readFileSync(Script.BASE_DIR + this.id.toString()).toString();
    }

    public deleteScript() {
        fs.unlink(Script.BASE_DIR + this.id.toString(), function (err) {
            if (err)
                console.error("can't delete file");
        });
        const scriptRepo: Repository<Script> = getConnection().getRepository(Script);
        scriptRepo.createQueryBuilder("script")
            .delete()
            .from("script")
            .where("script.id = :id", {id: this.id})
            .execute()
            .catch((err) => {
                console.error("can't delete from script table", err);
            });
    }
}