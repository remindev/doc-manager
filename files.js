import request from "request"; // imports request 

import * as Fs from "fs"; // imports file system from fs module
import { db } from "./db.js"; // imports db | owm module

const __dirname = process.cwd(); // defines currently working directory

export let fs = Fs;

export function init() {
    // this function make sure all this needed for this module to run exisits and are in good condition
    // some err cannot be pick up by this 
    // this funtion only wnat to run while initializin project and want to find some err
    // in case of some folder missing this function might help to recreate it bu it self

    // checks if root folder for all user content exists and if not  creates new folder 
    // any err while in process are recorderd by us will be in console
    folderCheck({ folderName: "users", createFolder: true }).catch(err => {
        console.log("Err : In fs init() ");
        console.log(err);
    });

    // checks if root folder for all user content exists and if not  creates new folder 
    // any err while in process are recorderd by us will be in console
    folderCheck({ folderName: "projects", createFolder: true }).catch(err => {
        console.log("Err : In fs init() ");
        console.log(err);
    });

};

function randomId(length, pathToCheckFileCopy) {
    // this function creates a reandom id 
    // controll id length by providing length to function (< length limit >, <pathToCheckFileCopy>);
    // if length not provided function returns id of default length of 10

    // declaring required veriables
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'.split(''); // all charectes tobe included in id 
    var str = ''; // output sting container

    if (!length) { // checks if any lenths are passed to function or not and runs if not

        // sets length as 10 || deafalt length
        length = 10;

    };

    for (var i = 0; i < length; i++) {
        // this loops runs according to the lenth provided
        // e.g.. function (100) runs this loop 100 times

        // adding each character to output string variable randomly 
        str += chars[Math.floor(Math.random() * chars.length)];

    };

    if (pathToCheckFileCopy) {

        if (fs.existsSync(`${pathToCheckFileCopy}/${str}.png`)) {
            return randomId(length, pathToCheckFileCopy);
        };

    };

    return str;  // returns output string

};

export function folderCheck({ folderName, createFolder }) {
    // this function checks if folder exists or not 
    // you add value of true to createNwFile veriable to create new folder if not exists 

    // returns a promise call back as the result of this function
    return new Promise((resolve, reject) => {

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

export function userFilesChecker(userID) {
    // this function gets and syncs users file's like image and other files from user obj to users folder
    // this function takes inpot as user's uid

    // gets users data by using uid from db
    db({
        get: {
            uid: userID
        },
        auth_users: true

    }).then(userData => {
        // user data ...

        let userObj = userData[0]; // users data object

        if (userObj.imgUrl) { // checks if image url is avilable

            // checks if image is already in folder or not
            if (!fs.existsSync(`${__dirname}/users/${userID}/pp.png`)) {

                // requesting to image url for image
                request(userObj.imgUrl)

                    // creates a data stream and saves image file
                    .pipe(fs.createWriteStream(`${__dirname}/users/${userID}/pp.png`))
                    .on('close', (event) => {

                        // user's profile picture image saved...

                        let path = `${__dirname}/publicUserContents/images`; // path of public folder which contains all users profile image
                        let pathOfUserPP = `${__dirname}/users/${userID}/pp.png`; // path of private users folders which contains original user profile image
                        let publicImageName = randomId(20, path); // new random name for image ( path is provided to find duplicate and prevent duplicate naming )

                        // reads image from provate users folder
                        fs.readFile(pathOfUserPP, (err, data) => {
                            // creating file copy and updating name to db....

                            // logs if find an err in reading  image
                            if (err) { console.log(err); };

                            // saves image in new name to public user content folder with newly created random name
                            fs.writeFile(`${path}/${publicImageName}.png`, data, res => {
                                // saving image to public folder...

                                // saves the new random name to db by the path of url wich can be used to get image for client
                                db({
                                    updateOne: {
                                        query: { uid: userID },
                                        NewValues: { img: `/usr/${publicImageName}.png` }
                                    },
                                    auth_users: true
                                    // saving data to db....
                                }).catch(err=>{
                                    // err from updating dat a to db...
                                    console.log(err);
                                });

                                // public copy created and updated url to db....

                            });

                        });


                    });

            } else {
                // runs if the image exists 

                // here we check that this image is in db by its public folder name | the only way we can acess by client
                db({
                    get: {
                        uid: userID
                    },
                    auth_users: true
                    // getting user data from db....
                }).then(res => {

                    if (!res.img) {
                        // runs if image url not exist in db

                        // user's profile picture image saved...
                        let path = `${__dirname}/publicUserContents/images`; // path of public folder which contains all users profile image
                        let pathOfUserPP = `${__dirname}/users/${userID}/pp.png`; // path of private users folders which contains original user profile image
                        let publicImageName = randomId(20, path); // new random name for image ( path is provided to find duplicate and prevent duplicate naming )

                        // reads image from provate users folder
                        fs.readFile(pathOfUserPP, (err, data) => {

                            // logs if find an err in reading  image
                            if (err) { console.log(err); };

                            // saves image in new name to public user content folder with newly created random name
                            fs.writeFile(`${path}/${publicImageName}.png`, data, res => {

                                // saves the new random name to db by the path of url wich can be used to get image for client
                                db({
                                    updateOne: {
                                        query: { uid: userID },
                                        NewValues: { img: `/usr/${publicImageName}.png` }
                                    },
                                    auth_users: true
                                    // saving data to db....
                                }).catch(err=>{
                                    // err from updating dat a to db...
                                    console.log(err);
                                });

                            });

                        });

                    };

                })

            };

        };

    }).catch(err => {
        // err at getting user data from db
        console.log(err);
    });

};