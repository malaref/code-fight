import { Column, Entity, getConnection, ManyToOne, PrimaryColumn } from "typeorm";
import { User } from "./User";
import { Script } from "./Script";

@Entity()
export class Privilege {

    static OWNER: string = "OWNER";
    static VIEWER: string = "VIEWER";
    static CONTRIBUTOR: string = "CONTRIBUTION";

    @Column()
    contributionLevel!: string;

    @PrimaryColumn()
    userUsername!: string;

    @PrimaryColumn()
    scriptId!: number;

    @ManyToOne(type => User, user => user.privileges)
    user!: User;

    @ManyToOne(type => Script, script => script.privileges)
    script!: Script;

    constructor(user: User, script: Script, contributionLevel: string) {
        if (user != undefined && script != undefined && contributionLevel != undefined) {
            this.contributionLevel = contributionLevel;
            this.user = user;
            this.script = script;
            this.userUsername = user.username;
            this.scriptId = script.id;
        }
    }

    /*
     * @return the privilege if it exists else undefined
     */
    static async getPrivilege(username: string, scriptId: number) {
        const repo = getConnection().getRepository(Privilege);
        const privilege: Privilege | undefined = await repo
            .createQueryBuilder("privilege")
            .where("privilege.userUsername = :tempUsername", {tempUsername: username})
            .andWhere("privilege.scriptId = :tempId" , {tempId: scriptId})
            .getOne();
        return privilege;
    }
}