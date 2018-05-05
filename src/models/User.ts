import { Column, Connection, Entity, getConnection, PrimaryColumn, Repository } from "typeorm";
import { Script } from "./Script";
import { Privilege } from "./Privilege";
import bcrypt from "bcryptjs";

@Entity()
export class User {
    @PrimaryColumn({unique: true})
    username!: string;

    @Column()
    password!: string;

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
        const hashedPassword: string = bcrypt.hashSync(password, process.env.BCRYPT_SALT);
        const repo = getConnection().getRepository(User);
        let user = await repo
            .createQueryBuilder("user")
            .where("user.username = :tempUsername", {tempUsername: username})
            .getOne();
        if (user == undefined) {
            user = new User(username, hashedPassword);
            repo.save(user).catch((err) => {
                console.error("User.internal error", err);
            });
        }
        return user;
    }

    /*
     *@return user if the user exists else undefined
     */
    static async authenticate(username: string, password: string) {
        const repo = getConnection().getRepository(User);
        const user: User|undefined = await repo
            .createQueryBuilder("user")
            .where("user.username = :tempUsername", {tempUsername: username})
            .getOne();
        if (user == undefined) {
            return user;
        } else {
            if (bcrypt.compareSync(password, user.password)) {
                return user;
            } else {
                return undefined;
            }
        }
    }

    /*
     * @return the User if he exists else undefined
     */
    static async getUser (username: string) {
        const repo = getConnection().getRepository(User);
        return await repo.findOne(username);
    }

    /*
     * @return Script
     */
    public async createNewScript (scriptName: string) {
        const scriptsRepo = getConnection().getRepository(Script);
        const script = new Script(scriptName);
        await scriptsRepo.save(script);
        const privilegeRepo = getConnection().getRepository(Privilege);
        const privilege = new Privilege(this, script, Privilege.OWNER);
        privilegeRepo.save(privilege).catch((err) => {
            console.error("error saving the privilege", err);
        });
        return script;
    }

    /*
     *@return list of Scripts that user has access to, and empty list if none exists
     */
    public async getUserScripts() {
        const query = getConnection().getRepository(Script).createQueryBuilder("script");
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
    public async getUserScript (scriptId: number) {
        const query = getConnection().getRepository(Script).createQueryBuilder("script");
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

    /*
     *@return boolean true if the script is deleted successfully else false
     */
    public async deleteScript(scriptId: number) {
        const connection: Connection = getConnection();
        const privilegeRepo: Repository<Privilege> = connection.getRepository(Privilege);
        const privilege: Privilege|undefined = await privilegeRepo
            .createQueryBuilder("privilege")
            .where("privilege.userUsername = :username", {username: this.username})
            .andWhere("privilege.scriptId = :id", {id: scriptId})
            .andWhere("privilege.contributionLevel = :level", {level: Privilege.OWNER})
            .getOne();
        if (privilege == undefined) {
            return false;
        } else {
            privilegeRepo.createQueryBuilder("privilege")
                .delete()
                .from("privilege")
                .where("privilege.scriptId = :id", {id: scriptId})
                .execute()
                .catch((err) => {
                    console.error("can't delete from privilege table", err);
                });
            const script: Script| undefined = await Script.getScript(scriptId);
            if (script) {
                script.deleteScript();
            } else {
                console.error("can't delete this script");
            }
            return true;
        }
    }
    /*
     *@return privilege if exists else undefined
     */
    public async getUserPrivilege(scriptId: number) {
        return await getConnection()
            .getRepository(Privilege)
            .createQueryBuilder("privilege")
            .where("privilege.scriptId = :id",
                {id : scriptId})
            .andWhere("privilege.userUsername = :userName",
                {userName: this.username}).getOne();
    }

    public static async getAllUsers() {
        const connection: Connection = getConnection();
        return await connection.getRepository(User).find();
    }


}

