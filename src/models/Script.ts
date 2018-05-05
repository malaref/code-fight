import { Column, Entity, getConnection, PrimaryGeneratedColumn, Repository } from "typeorm";
import { User } from "./User";
import { Privilege } from "./Privilege";
import fs from "fs";
import { execSync } from "child_process";
import { applyPatch } from "diff";

@Entity()
export class Script {
    private static HELLO_WORLD: string = "console.log(\"Hello world!\")\n";

    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column({type: "text"})
    code!: string;

    constructor(name: string) {
        if (name != undefined) {
            this.name = name;
            this.code = Script.HELLO_WORLD;
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
        const text: string = this.code;
        const patchedText: string = applyPatch(text, patch);
        this.code = patchedText;
        await getConnection().getRepository(Script).save(this).catch((err) => {
            console.error("can't apply patch ", err);
        });
        return true;
    }

    /*
     *@return the stdout in a string if running successfully else undefined
     *@params DO NOT use "" as an input use " " if there is no input
     */
    public runScript(inputStream: string): string|undefined {
        if (inputStream == "") {
            inputStream = " ";
        }
        if (this.code == undefined) {
            console.error("something bad is happening in running");
        }
        const fileName: string = this.id.toString() + ".js";
        fs.writeFileSync(fileName, this.code);
        const command: string = "node " + fileName;
        const result: string = execSync(command , {
            input: inputStream,
            timeout: 5000
        }).toString();
        fs.unlinkSync(fileName);
        return result;
    }

    /*
     *@return the golden file of the project
     */
    public getScriptCode(): string {
        return this.code;
    }

    public deleteScript() {
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