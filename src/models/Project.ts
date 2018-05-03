import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User";
import { Privilege } from "./Privilege";
import fs from "fs";
import { Patch } from "../diff/patch";
import { DB } from "../app";

@Entity()
export class Project {

    private static BASE_DIR: string = "./projects/";

    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @OneToMany(type => Privilege, privilege => privilege.project)
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
     * @return project if it exists else undefined
     */
    static async getProject (projectId: number) {
        const projectRepo = DB.getRepository(Project);
        return await projectRepo.findOne(projectId);
    }

    /*
     * @description this function add or edit user's privileges
     * @return bool the status of the operation
     */
    public async addUserToProject(ownerUsername: string, newUsername: string, newContributionLevel: string) {
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
            await DB.getRepository(Privilege).save(newUserPrivilege);
            await this.addPrivilege(newUserPrivilege);
            await newUser.addPrivilege(newUserPrivilege);
        } else {
            UserPrivilege.contributionLevel = newContributionLevel;
            await DB.getRepository(Privilege).save(UserPrivilege);
        }
        return true;
    }

    /*
     *@params the patch needed to be applied in TEXT FORMAT OF THE GOOGLE DMF
     *@return boolean the status of the operation
     */
    public async applyPatch (patchAsTextPatch: string, filePath: string) {
        const path: string = Project.BASE_DIR + this.id.toString(10) + filePath;
        if (!fs.existsSync(path)) {
            return false;
        }
        const text: string = fs.readFileSync(path).toString();
        const patchedText: string = Patch.applyPatch(patchAsTextPatch, text);
        fs.writeFile(path, patchedText, (err) => {
            if (err) {
                console.error("error writing the file", err);
            }
        });
        return true;
    }

    public createProjectStructure() {
        // TODO u must know which directory u are in to know how to navigate (in my code i was in the root)
        if (!fs.existsSync(Project.BASE_DIR)) {
            fs.mkdirSync(Project.BASE_DIR);
        }
        fs.mkdirSync(Project.BASE_DIR + this.id.toString(10));
    }

    /*
     * @example relative path = /new_dir or /old_dir/new_dir
     * @return void
     */
    public createDirectory (relativePathFromRoot: string) {
        const path: string = Project.BASE_DIR + this.id.toString(10) + relativePathFromRoot;
        if (!fs.existsSync(path)) {
            fs.mkdirSync(path);
        }
    }

    /*
     * @example relative path = /new_dir or /old_dir/new_dir
     * @return void
     */
    public createFile (relativePathFromRoot: string) {
        const path: string = Project.BASE_DIR + this.id.toString(10) + relativePathFromRoot;
        if (!fs.existsSync(path)) {
            fs.open(path, "w", function (err) {
                if (err) console.error("error in creating file ", err);
                console.log("Saved!");
            });
        }
    }

    /*
     *@return an JS object example
     *  { path: './projects/29',
     *    name: '29',
     *    children:
     *     [ { path: 'projects/29/dir1',
     *         name: 'dir1',
     *         children: [Array],
     *         size: 0,
     *         type: 'directory' } ],
     *    size: 0,
     *    type: 'directory' }
     */
    public getProjectStructure () {
        const dirTree = require("directory-tree");
        return dirTree(Project.BASE_DIR + this.id.toString(10), {normalizePath : true});
    }
}