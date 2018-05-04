import { Column, Entity, OneToMany, PrimaryColumn } from "typeorm";
import { Script } from "./Script";
import { Privilege } from "./Privilege";
import { DB } from "../app";

@Entity()
export class User {
    @PrimaryColumn({unique: true})
    username!: string;

    @Column()
    password!: string;

    @OneToMany(type => Privilege, privilege => privilege.user)
    privileges!: Privilege[];

    private constructor (username: string, password: string) {
        if (username != undefined && password != undefined) {
            this.username = username;
            this.password = password;
        }
    }

    /*
     * @return User if created successfully else undefined
     */
    static async createNewUser (username: string, password: string) {
        const repo = DB.getRepository(User);
        let user = await repo
            .createQueryBuilder("user")
            .where("user.username = :tempUsername", {tempUsername: username})
            .getOne();
        if (user == undefined) {
            user = new User(username, password);
            await repo.save(user).catch((err) => {
                console.error("User.internal error", err);
            });
        }
        return user;
    }

    /*
     *@return user if the user exists else undefined
     */
    static async authenticate(username: string, password: string) {
        const repo = DB.getRepository(User);
        return await repo
            .createQueryBuilder("user")
            .where("user.username = :tempUsername", {tempUsername: username})
            .andWhere("user.password = :tempPassword", {tempPassword: password})
            .getOne();
    }

    /*
     * @return the User if he exists else undefined
     */
    static async getUser (username: string) {
        const repo = DB.getRepository(User);
        return await repo.findOne(username);
    }

    /*
     * @return Script
     */
    public async createNewScript (scriptName: string) {
        // TODO don't make the user make the script with the same name
        const scriptsRepo = DB.getRepository(Script);
        const script = new Script(scriptName);
        await scriptsRepo.save(script);
        const privilegeRepo = DB.getRepository(Privilege);
        const privilege = new Privilege(this, script, Privilege.OWNER);
        this.addPrivilege(privilege);
        script.addPrivilege(privilege);
        privilegeRepo.save(privilege).catch((err) => {
            console.error("error saving the privilege", err);
        });
        script.createScriptStructure();
        return script;
    }

    public addPrivilege (privilege: Privilege) {
        if (this.privileges == undefined) {
            this.privileges = [];
        }
        this.privileges.push( privilege );
    }

    /*
     *@return list of Scripts that user has access to, and empty list if none exists
     */
    public async getUserScripts() {
        const query = DB.getRepository(Script).createQueryBuilder("script");
        const scripts: Script[] = await query
            .where("script.id IN " + query.subQuery()
                .select("privilege.scriptId")
                .from(Privilege, "privilege")
                .where("userUsername = :username", {username: this.username})
                .getQuery())
            .getMany();
        return scripts;
    }

    /*
     *@return Script if he is allowed to access it else undefined
     *@comment in case u need a boolean instead of object just return (script==undefined)
     */
    public async getUserScript (scriptId: number){
        const query = DB.getRepository(Script).createQueryBuilder("script");
        const script: Script|undefined = await query
            .where("script.id IN " + query.subQuery()
                .select("privilege.scriptId")
                .from(Privilege, "privilege")
                .where("userUsername = :username", {username: this.username})
                .andWhere("scriptId = :id", {id: scriptId})
                .getQuery())
            .getOne();
        return script;
    }
}

