import { rejects } from "assert";
import * as fs from "fs"; // imports file system from fs module
import { resolve } from "path";

const __dirname = process.cwd(); // defines currently working directory

export function init() { 
    // this function make sure all this needed for this module to run exisits and are in good condition
    // some err cannot be pick up by this 
    // this funtion only wnat to run while initializin project and want to find some err
    // in case of some folder missing this function might help to recreate it bu it self

    // checks if root folder for all user content exists and if not  creates new folder 
    // any err while in process are recorderd by us will be in console
    folderCheck({ folderName: "users", createFolder: true }).catch(err=>{
        console.log("Err : In fs init() ");
        console.log(err);
    });

    // checks if root folder for all user content exists and if not  creates new folder 
    // any err while in process are recorderd by us will be in console
    folderCheck({ folderName: "projects", createFolder: true }).catch(err=>{
        console.log("Err : In fs init() ");
        console.log(err);
    });

};


export function folderCheck({ folderName, createFolder }) {
    // this function checks if folder exists or not 
    // you add value of true to createNwFile veriable to create new folder if not exists 

    // returns a promise call back as the result of this function
    return new Promise((resolve, rejects) => {

        // checks uif folder not exists 
        if (!fs.existsSync(`${__dirname}/${folderName}`)) {

            // if the create folder veriable is true 
            if (createFolder) {

                // creates a fiolder 
                fs.mkdirSync(`${__dirname}/${folderName}`);

                // return sucess message
                resolve("Folder created");

            };

        // folder exists 
        } else {

            // return sucess message
            resolve("Folder exists");

        };

    });

};

