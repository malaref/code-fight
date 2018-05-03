import { Column, Entity, OneToMany, PrimaryColumn } from "typeorm";
import { Project } from "./Project";
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
     * @return bool true if the user is created successfully else false
     */
    static async createNewUser (username: string, password: string) {
        const repo = DB.getRepository(User);
        let user = await repo
            .createQueryBuilder("user")
            .where("user.username = :tempUsername", {tempUsername: username})
            .getOne();
        if (user == undefined) {
            // TODO hash the password
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
     * @return Project
     */
    public async createNewProject (projectName: string) {
        // TODO don't make the user make the project with the same name
        const projectsRepo = DB.getRepository(Project);
        const project = new Project(projectName);
        await projectsRepo.save(project);
        const privilegeRepo = DB.getRepository(Privilege);
        const privilege = new Privilege(this, project, Privilege.OWNER);
        this.addPrivilege(privilege);
        project.addPrivilege(privilege);
        privilegeRepo.save(privilege).catch((err) => {
            console.error("error saving the privilege", err);
        });
        project.createProjectStructure();
        return project;
    }

    public addPrivilege (privilege: Privilege) {
        if (this.privileges == undefined) {
            this.privileges = [];
        }
        this.privileges.push( privilege );
    }
}

/*
exec("dir" , (err, stdout, stderr)=>{
            if (err != null){
                console.error("there is error here", err);
            }
            console.log(stdout);
            console.log(stderr);
        });

        exec("mkdir .\\projects\\test" , (err, stdout, stderr)=>{
            if (err != null){
                console.error("there is error here", err);
            }
            console.log(stdout);
            console.log(stderr);
        });
 */
