import { db } from './db.js' // importing db 
import DeviceDetector from "device-detector-js"; // importing device detector for formatting and making a useful object with user agent
import { VERSION } from 'ejs';

const __dirname = process.cwd(); // defines currently working directory
const deviceDetector = new DeviceDetector(); // initializes device detector functon

/**
 * This function make a device object from user-agent string collected from request object,
 * This is a middleware function
 * 
 * @param {object} req - request object
 * @param {object} res - response object
 * @param {object} next - next function
 */
export function deviceLayout(req, res, next) {

    //parsing user agent from request
    let device = deviceDetector.parse(req.headers['user-agent']).device.type;

    // check if parsing retuns an er or not exist device object
    if (!device) {

        // set other as device value
        device = {
            device: "other"
        };

    };

    // creats a object to store layout and device name 
    let layouts = {
        device: device,
        layout: ``,
    };

    // list of all avilable devices for layouts we created in ejs
    let list = ["smartphone", "desktop"];

    // checks which device and adds layout accordingly
    if (list[0] == device) {

        // adds layout folder name
        layouts.layout = `${__dirname}/views/base/base-b`;

    } else if (list[1] == device) {

        // adds layout folder name
        layouts.layout = `${__dirname}/views/base/base-a`;
    } else {

        // adds layout folder name
        layouts.layout = `${__dirname}/views/base/base-c`;
        device.device = 'other';

    };

    // adds layouts object to main request.device object
    req.device = layouts;

    // moves to next function
    next();

};

/**
 * This function convets string date values to readale 
 * 
 * @param {string} date - date string
 * @returns {string} Readable date Formatted like < DD - MM - YYYY > e.g.. 1 january 2020
 */
export function dateToReadable(date) {

    /* list fo monts in an array || output expected format example.. 1 january 2020 - 10:25 */
    let months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
    ];
    let dateObj = new Date(date);  // creates date object from input stringS

    // function returns output string as a promise
    return new Promise((resolve, reject) => {

        // checkes if date input is valid or not
        if (dateObj == "Invalid Date") {
            // senting err as rejected promise
            reject("invalid date || at function dateToReadable(<passed invalid date here>)");
        };

        // adding date and time to output string from date object
        let output = dateObj.getDate() + " " + (months[dateObj.getMonth()]) + " " + dateObj.getFullYear(); // + " - " + dateObj.getHours() + ":" + dateObj.getMinutes() // add if needed

        resolve(output); // senting redable date as fulfilled promise 

    });

};


/**
 * Generates a random id with length control
 * 
 * @param {number} length - Length of returning id
 * @returns - random ID e.g.. randomID(10) => AdF6ui-_oD 
 */
function randomId(length) {
    // this function creates a reandom id 
    // controll id length by providing length to function (< length limit >);
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

    return str;  // returns output string

};

export function updateUserToDb(requst) {
    // updating user data to database server
    // this function return a callback object
    // used in api to update user data like name | email | etc...
    // this function outputs a promise 

    // creating variables required
    let allowed = ["name", "bio", "dob", "gender", "phone", "addCustom", "updateCustom", "removeCustom", "img"]; // allowed types input
    let notAllowed = ["email"]; // not allowed inputs

    let type = requst.query.type; // getting which type of data is coming from request
    let data = requst.body.data; // getting data from request
    let userID = requst.user.data.uid; // getting user ID from request

    return new Promise((resolve, reject) => {
        // returnes a promise as a result of this function

        // looping through all not permitted types and makes sure nothing nit permitted is updated
        notAllowed.forEach((value, index) => {

            // this conditon check if request tyoe match not allowed type
            if (value == type) {
                // code runs when not allowed type requested

                reject("this action is not permitted");
                // returnes a catch || err attribute , by rejecting promise
                return 0;
            };

        });

        allowed.forEach((value, index) => {
            // looping through all allowed types 

            if (value == type) {
                // code runs if allowed type is request's

                if (type == "addCustom") {
                    // runs if type is addCustom 

                    if (data.name.length <= 15 & data.name.length > 0) { // checks if new custom type name field value length not mare than limit
                        // runs if length is below limit | here limit is 15 .. migth change in future

                        if (data.data.length <= 100 & data.data.length > 0) { // checks if length value of field is not more than limit
                            // runs if length is below limit | here limit is 100 .. might cange in future

                            // calling function to add a custom condact option
                            // function({< new custom type from request body  > , < new custom data value > })
                            dbAddCustom({
                                name: data.name,
                                data: data.data
                            });

                        } else {
                            // runs is filed value length exeed limit 

                            // rejects promise by error text
                            reject("Exeeded maximum allowed characters");
                            return 0;
                        };

                    } else {
                        // runs if new field name length exeed limit

                        // rejects promise by error text
                        reject("Exeeded maximum allowed characters");
                        return 0;
                    };


                } else if (type == "updateCustom") {
                    // runs if type is updateCustom

                    // calling function to update a custom contact option

                    if (data.name.length <= 15 & data.name.length > 0) { // checks if new custom type name field value length not mare than limit
                        // runs if length is below limit | here limit is 15 .. migth change in future

                        if (data.data.length <= 100 & data.data.length > 0) { // checks if length value of field is not more than limit
                            // runs if length is below limit | here limit is 100 .. might cange in future

                            // calling function to update a custom condact option
                            dbupdateCustom(data);

                        } else {
                            // runs is filed value length exeed limit or no length

                            // rejects promise by error text
                            reject("Exeeded maximum allowed characters");
                            return 0;
                        };

                    } else {
                        // runs if new field name length exeed limit or no length

                        // rejects promise by error text
                        reject("Exeeded maximum allowed characters");
                        return 0;
                    };


                } else if (type == "removeCustom") {
                    // runs if type is removeCustom

                    // calling function to remove a custom contact option
                    // function(< data from request body  >)
                    dbRemoveCustom(data);

                } else {
                    // runs if type is not addcustom or removeCustom and is one of allowed

                    // calling a switch operator to check each individual conditions which match and return true with < type > veriable
                    // mainly for checking if input request's meet requiements 
                    switch (type) {

                        case "name": { // condition checks if it matches with "name" and < type >

                            if (data.length > 0 & data.length <= 50) {
                                // runs when length of new name is greaer tha 0 and less than 50

                                // calling function for updating data type like name phone etc..
                                // function(< type of data to be updated >, < value to updated >) 
                                dbType(type, data);

                            } else {
                                // runs if length of name not reach required or exeeded limit

                                // returnes an err in promise with error message
                                reject("Character error - more or less charactes are passed");
                                break; // to prevent more code exicution after rejection

                            };

                            break; // end of this case operator
                        };

                        case "bio": {  // condition checks if it matches with "bio" and < type >

                            if (data.length <= 100) {
                                // runs if input bio field data length meets required the condition 

                                // calling function for updating data type like name phone etc..
                                // function(< type of data to be updated >, < value to updated >) 
                                dbType(type, data);

                            } else {
                                // runs if length of bio not reach required or exeeded limit

                                // returnes an err in promise with error message
                                reject("More charactes are passed");
                                break; // to prevent more code exicution after rejection

                            };

                            break; // end of this case operator
                        };

                        case "phone": { // condition checks if it matches with "phone" and < type >

                            if (!+data) {
                                // checks if input data is a number 
                                // Hint: adding ' + ' operator in front of data veriable it will convert that veriable to string
                                // this contion will be passed if data veriable is not a number or has not contains a valid number

                                // returnes an err in promise with error message
                                reject("Data must be a number");
                                break; // to prevent more code exicution after rejection
                            };

                            if (data.length >= 10 & data.length <= 15) {
                                // runs if input phone number field data length meets required the condition 

                                // calling function for updating data type like name phone etc..
                                // function(< type of data to be updated >, < value to updated >) 
                                dbType(type, data);
                            } else {
                                // runs if length of phone number not reach required or exeeded limit

                                // returnes an err in promise with error message
                                reject("Not a valid number");
                                break; // to prevent more code exicution after rejection

                            };

                            break; // end of this case operator
                        };

                        case "genter": {

                            if (data == "male" || data == "female" || data == "other") {
                                // runs if input data equals male or female or other 

                                // calling function for updating data type like name phone etc..
                                // function(< type of data to be updated >, < value to updated >) 
                                dbType(type, data);

                            } else {
                                // runs if genter is not valid 

                                // returnes an err in promise with error message
                                reject("not provided a valid data");
                                break; // to prevent more code exicution after rejection
                            };

                        };

                        case "dob": {

                            let date = new Date(data); // creates a date object from data input

                            if (date == "Invalid Date") { // chects if date passed is valid or not
                                //runs if date value passed is not valid

                                // returnes an err in promise with error message
                                reject("date is not valid");
                                break; // to prevent more code exicution after rejection

                            } else {
                                // runs if date value passed is valid

                                let newdate = new Date();
                                if (date > newdate) {

                                    // returnes an err in promise with error message
                                    reject("date not exist");
                                    break; // to prevent more code exicution after rejection

                                } else {

                                    let mm, dd, yyyy;

                                    mm = date.getMonth() + 1;
                                    dd = date.getDate();
                                    yyyy = date.getFullYear();

                                    // get date from input data and formats it accorgingly

                                    // Convet date values to a string 
                                    let addableDate = `${dd}-${mm}-${yyyy}`;

                                    // uploads that sting of date to db

                                    // calling function for updating data type like name phone etc..
                                    // function(< type of data to be updated >, < value to updated >) 
                                    dbType(type, addableDate);

                                };

                            };

                            break; // to prevent more code exicution after rejection
                        };

                    };

                };

                function dbType(typeToUpdate, dataToUpdate, respData) {
                    // internal function
                    // function to update a type of data from user object
                    // function(< type of data to be updated >, < data of type to be updated >)

                    if(!respData){
                        respData = null;
                    };

                    db({
                        updateOne: {
                            query: { uid: userID },
                            NewValues: { [typeToUpdate]: dataToUpdate }
                        },
                        auth_users: true

                        // updating data .. 

                    }).then(res => {
                        // runs when update complete

                        // resolve sucess message after update
                        resolve({
                            first: `${typeToUpdate} updated sucessfully`,
                            second: respData
                        });
                        // update complete..

                    }).catch(err => {
                        // runs when an err occur while updating user data

                        // reject promise with err data
                        reject(err);
                        // error updating...
                    });

                };

                function dbupdateCustom(customdata) {
                    db({
                        get: {
                            uid: userID
                        },
                        auth_users: true

                        // collecting user data by user id ...

                    }).then(res => {

                        let dataCustom = res[0].custom; // data from db server

                        dataCustom.forEach((element, index) => {
                            // looping through all custom data and finds one with matching id

                            if (customdata.id.toLowerCase().trim() == element.id.toLowerCase().trim()) {
                                // runs if id matchs 

                                // console.log(`${index} : ${customdata.id} => ${element.id}`)
                                // updating data ... 
                                element.name = customdata.name;
                                element.data = customdata.data;
                            };

                        });

                        dbType("custom", dataCustom); // calling function to add user data with new user data objects

                    }).catch(err => {
                        //err while reading from db
                        console.log(err);
                    });

                };

                function dbAddCustom(customData) {
                    // internal function
                    // function for add custom field in contact option user data object
                    // function(< custom data object to added >)
                    //
                    // data input strecture
                    // {
                    //     name:< field name of data to be added >,
                    //     data:< field value to be added >
                    // }
                    // 

                    db({
                        get: {
                            uid: userID
                        },
                        auth_users: true

                        // collecting user data by user id ...

                    }).then(res => {
                        // runs after user data is collected
                        // adding new custom contact field to user object collected

                        let upExistingData = res[0].custom; // user custom contact data

                        if (!upExistingData) {
                            // checks if the data from db is valid if not then creates new data array

                            upExistingData = []; // data will be added to fresh empty array
                        };

                        let limit = 5; // this veriable holds the limit for maximum allowed fields of custom contact options's

                        if (upExistingData.length >= limit) {
                            // runs if the number of fields exeed the limit amount

                            // rejecting function with err message
                            reject(`more than ${limit} custom contact options is not allowed`);
                            return 0; // to prevent additional code running...
                        };

                        let rejectFound = false; // this var help to stop exicution of further code if its value becomes true after upcoming loop runs

                        upExistingData.forEach((element, index) => {
                            // loops through all custom options if any || objective is to find duplicate with new request 

                            if (customData.name.toLowerCase().trim() == element.name.toLowerCase().trim()) {
                                // check's if any name of field match new requsted name || rejects if duplicate finds

                                // rejecting function with err message

                                rejectFound = true;
                                reject(`field named ' ${customData.name} ' already exists`);
                                return 0; // to prevent additional code running...
                            };

                        });

                        if (rejectFound) { // check if any reject fonut on above loop 

                            // if found stops exicution of further code
                            return 0;
                        };

                        let id;

                        function idCreater() {
                            // this functin creates a random id and makeshure if duplicate id is not creats 

                            id = randomId(5); // creates random id with 5 character length

                            upExistingData.forEach((element, index) => {
                                // loops through all custom fields

                                // if finds matching id to newly creaed id 
                                if (element.id == id) {

                                    // re runs the funtion and creats new id
                                    return idCreater();
                                };

                            });

                        };

                        idCreater(); // calling id creater function

                        let dataCreator = {}; // this veriables holds new custom data object

                        dataCreator["name"] = customData.name; // added custom field name
                        dataCreator["data"] = customData.data; // added custom data
                        dataCreator["id"] = id; // creats and adds a random id to the field

                        upExistingData.push(dataCreator); // adding data to custom data's list array 

                        dbType("custom", upExistingData, id); // calling function to add user data with new user data objects

                        // adding used data ...

                    }).catch(err => {
                        // err from database read
                        console.log(err);
                    });

                };

                function dbRemoveCustom(typeToDelete) {
                    // internal function
                    // function for remove custom field in contact option user data object
                    // function(< custom data type to delete >)
                    //

                    db({
                        get: {
                            uid: userID
                        },
                        auth_users: true

                        // collecting user data by user id ...

                    }).then(res => {
                        // runs after user data is collected
                        // removing existing custom contact field to user object collected

                        if (!res.length > 0) {
                            reject("Field not exist");
                            return 0;
                        };

                        let downExistingData = res[0].custom; // user custom contact data

                        downExistingData.forEach((element, index) => {

                            if (typeToDelete.id == element.id) {
                                downExistingData.splice(index, 1);
                            };

                        });



                        // console.log(downExistingData)

                        dbType("custom", downExistingData); // calling function to update removied user data

                        // removing user data ..

                    }).catch(err => {
                        // err from db reading
                        console.log(err);
                    });

                };

            };

        });

    });

};














export function search(filter) {
    return new Promise((res, rej) => {

        var index = [];
        var filterdST = [];
        var filterdCN = [];
        var output = {};
        var noResult = true;

        db.projects({ get: {} }, 'noId').then(data => {

            data.forEach(element => {
                index.push(element['name'] + element['pid']);
            });

            filterdST = index.filter(word => word.startsWith(filter));
            filterdCN = index.filter(word => word.includes(filter));

            filterdST.forEach(element => {  // starts with 
                var id = index.indexOf(element);
                output[data[id].pid] = data[id];
            });
            filterdCN.forEach(element => {  // contains 
                var id = index.indexOf(element);
                output[data[id].pid] = data[id];
                noResult = false;
            });
            index.forEach(element => {     //  all
                var id = index.indexOf(element);
                output[data[id].pid] = data[id];
            });


            res(buld(output, { noResult: noResult }));
            // res(output)
        })

    });
}

function buld(objectInput, { noResult }) {
    return new Promise((res, rej) => {

        var output = ``;

        if (noResult) {
            output += `
            <li class="no-result-font">
                <img src="/icn/noresult.png">
                <div class="txt">You may like these !</div>
            </li>
            `;
        }

        for (var x in objectInput) {
            output += `

            <li onclick="window.location.href=orgin+'view?v=`+ objectInput[x]['pid'] + `'">
            <div class="imgCont">
                <img src="`+ objectInput[x]['img'] + `">
            </div>
            <div class="text_cont">
                <div class="titles">`+ objectInput[x]['name'] + `</div>
                <div class="tail">`+ objectInput[x]['about'] + `</div>
            </div>
            </li>

            `;
        }

        res(output);
    });
}