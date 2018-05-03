import { Column, Entity, ManyToOne, PrimaryColumn } from "typeorm";
import { User } from "./User";
import { Project } from "./Project";
import { DB } from "../app";


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
    projectId!: number;

    @ManyToOne(type => User, user => user.privileges)
    user!: User;

    @ManyToOne(type => Project, project => project.privileges)
    project!: Project;

    constructor(user: User, project: Project, contributionLevel: string) {
        if (contributionLevel === Privilege.VIEWER || contributionLevel === Privilege.OWNER || contributionLevel === Privilege.CONTRIBUTOR) {
            this.contributionLevel = contributionLevel;
            this.user = user;
            this.project = project;
            this.userUsername = user.username;
            this.projectId = project.id;
        } else {
            throw new Error("Should never get here!");
        }
    }

    /*
     * @return the privilege if it exists else undefined
     */
    static async getPrivilege(username: string, projectId: number) {
        const repo = DB.getRepository(Privilege);
        const privilege: Privilege | undefined = await repo
            .createQueryBuilder("privilege")
            .where("privilege.userUsername = :tempUsername", {tempUsername: username})
            .andWhere("privilege.projectId = :tempId" , {tempId: projectId})
            .getOne();
        return privilege;
    }
}