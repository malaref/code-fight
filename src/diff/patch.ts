
export class Patch {
    static diff = require("./diff_match_patch_uncompressed.js");
    static dmp = new Patch.diff.diff_match_patch();
    // TODO check the result of patching
    static applyPatch (patchText: string, fileText: string): string {
        const patch = Patch.dmp.patch_fromText(patchText);
        const [text, result] = Patch.dmp.patch_apply(patch, fileText);
        return text;
    }
    static createPatch (originalText: string, newText: string): string {
        const patch = Patch.dmp.patch_make(originalText, newText);
        const textPatch: string = Patch.dmp.patch_toText(patch);
        return textPatch;
    }
}

// help code
/*let txt1 : string = "text 1";
        let txt2 : string = "text 2";
        let txt3 : string = "text 3";
        let diffs1 = Patch.dmp.diff_main(txt1, txt2);
        console.log(diffs1);
        Patch.dmp.diff_cleanupEfficiency(diffs1);
        console.log(diffs1);
        let patch1 = Patch.dmp.patch_make(diffs1);
        console.log(patch1);
        let patch2 = Patch.dmp.patch_make(txt1, diffs1);
        console.log(patch2);
        let patch1txt = Patch.dmp.patch_toText(patch1);
        console.log("patch txt", patch1txt);
        console.log(Patch.dmp.patch_fromText(patch1txt));
        console.log(Patch.dmp.patch_apply(patch1, txt3));*/

/*
let original :string = "int x = 10;\nfloat y = 5.0 \ndouble z = 2.3\n";
        let v1 :string = "int x = 9;\nfloat y = 5.0 \ndouble z = 2.3\n";
        let v2 :string = "int x = 10;\nffloat y = 5.0 \ndouble z = 2.3\n";
        let v3 :string = "int x = 10;\nfloat y = 5.0 \ndouble z = 2.8\n";

        let patch1 = Patch.dmp.patch_make(original, v1);
        let patch2 = Patch.dmp.patch_make(original, v2);
        let patch3 = Patch.dmp.patch_make(original, v3);

        //console.log(Patch.dmp.diff_main(original, v1));
        //console.log(Patch.dmp.diff_main(original, v2));
        //console.log(Patch.dmp.diff_main(original, v3));

        //console.log(patch2);
        //console.log(patch3);

        console.log(original);
        let [r1, b1] = Patch.dmp.patch_apply(patch1, original);
        let [r2, b2] = Patch.dmp.patch_apply(patch2, r1);
        let [r3, b3] = Patch.dmp.patch_apply(patch3, r2);
        console.log(r1, b1);
        console.log(r2, b2);
        console.log(r3, b3);
 */