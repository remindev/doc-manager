import { config } from 'dotenv'; config(); // imports dot env for acessing environmental veriables
import { MongoClient, ObjectId } from 'mongodb'; // imports mongodb 

export var ObjId = ObjectId; // exprting Object id from mongodb as ObjId

export class userObj {
    /**
     * This function is a object creater for user
     * 
     * @param {object} userData - User ID
     * @param {string} userData.name - User Name
     * @param {string} userData.dob - Date of berth
     * @param {string} userData.email - Email adress
     * @param {string} userData.gender - Gender
     * @param {string} userData.img - Image URL from this server
     * @param {string} userData.imgUrl - Image URL from extenal servers
     * @param {number} userData.phone - Phone number
     * @param {string} userData.createdAt - Date of creation 
     * @param {string} userData.lastSignIn - Date of last sign in
     * @param {string} userData.bio - Bio of user
     * @param {string} userData.provider - Provider name of login service
     * @param {string} userData.role - Role of user | admin or user
     * @param {boolean} userData.disabled - User disabled or not
     * @param {Array} userData.settings - Store's custom settings of user
     * @param {Array} userData.custom - Custom contact option for user
     */

    constructor({ uid, name, dob, email, gender, img, imgUrl, phone, createdAt, lastSignIn, bio, provider, role, disabled, settings, custom }) {
        /* assining value to constructor object from data input */

        this.uid = uid; // creats user id field   < "fvytr215212vt2vyt1r2v" > type = string
        this.name = name; // creates name field   < "Example name" > type = string
        this.dob = dob; // creates date of berth field  < "21-12-2004" > type = string
        this.gender = gender; // creates genetr field  < "male" > type = string
        this.email = email; // creates email field  < "email@example.com" > type = string
        this.img = img; // creates image url field  < "https://example.image.com/url" > type = string
        this.imgUrl = imgUrl // creates image url field  < "https://example.image.com/url" > type = string
        this.phone = phone; // creates phone number field < 90000001111 > type = number
        this.createdAt = createdAt; // creates a date obj for created at  < date > type = string | date object
        this.lastSignIn = lastSignIn; // creates a date object for last sign in < date > type = string | date object
        this.bio = bio; // creates bio field  < "REMINZ GOING EXPLORE MODE" > type = string
        this.provider = provider; // creates a provider field < "phone | google" > type = string
        this.role = role; // creates role object  < "Admin" > type = string
        this.disabled = disabled; // creates field to know if user is disabled or not < true > type = boolean
        this.settings = settings; // settings object containg user preffernses and themes < {} > type = object
        this.custom = []; // custom object contains custom contact data < {} > type = object

        // checks if custom value is present if create a object with value else creates an empty object
        if (custom) {
            // if custom value is provided add that value to user object
            this.custom = custom;
        };

    };

};


/**
 * This function controlls all data request to db other than sessions and
 * this is the main function that controlls the db communications and simplifis it and
 * reads, writes, delete and update data and returnes a promise callback 
 * 
 * @param {object} serverActionsAndOptions
 * @param {object} serverActionsAndOptions.get - input function(get:{ <bulk find query> });  
 * @param {object} serverActionsAndOptions.getOne - input function(getOne:{ <find query> });
 * @param {object} serverActionsAndOptions.getByID - input function(getById:{ <id> });       
 * @param {object} serverActionsAndOptions.setOne - input function(setOne:{ <data to save> });           
 * @param {object} serverActionsAndOptions.setMany - input function(setMany:{[ <data to save>},{<data to save>} ]); 
 * @param {object} serverActionsAndOptions.deleteOne - input function(deleteOne:{ <find query> }); 
 * @param {object} serverActionsAndOptions.deleteMany - input function(deleteMany:{ < bulk find query> });  
 * @param {object} serverActionsAndOptions.updateOne - input function(updateOne:{ query:{<find Query>}, NewValues:{<New values>} }); 
 * @param {object} serverActionsAndOptions.projection - data output projection function({ <get:{}>||other  , projection:{ id:-1 , name:1 } })
 * @param {object} serverActionsAndOptions.auth_users - type of db functon( get:{} , projection:{} , auth_users:true )  
 * @param {object} serverActionsAndOptions.auth_sessions - type of db functon( get:{} , projection:{} , auth_sessions:true 
 * @param {object} serverActionsAndOptions.projects - type of db functon( get:{} , projection:{} , projects:true )   
 */

export function db(
    
    // data inputs of function 
    {
        get, // input function(get:{ <bulk find query> });                                          | ---
        getOne, // input function(getOne:{ <find query> });                                         | --
        getByID, // input function(getById:{ <id> });                                               | -
        setOne, // input function(setOne:{ <data to save> });                                       | NOTE : only one of these options are allowed.
        setMany, // input function(setMany:{[ <data to save>},{<data to save>} ]);                  |        if more options passed function will reject the promise callback.
        deleteOne, // input function(deleteOne:{ <find query> });                                   | -
        deleteMany, // input function(deleteMany:{ < bulk find query> });                           | --
        updateOne, // input function(updateOne:{ query:{<find Query>}, NewValues:{<New values>} }); | ---

        projection, // data output projection function({ <get:{}>||other  , projection:{ id:-1 , name:1 } })

        auth_users, // type of db functon( get:{} , projection:{} , auth_users:true )       | -
        auth_sessions, // type of db functon( get:{} , projection:{} , auth_sessions:true ) | NOTE : only one db can be connected at a time only
        projects // type of db functon( get:{} , projection:{} , projects:true )            | -
    }
) {

    // creates a promise and returs the promise callback
    return new Promise((resolve, reject) => { // inside promise 


        let typeDupFinter = []; /** a variable to hold values of all option's passed | to find duplicates in request */
        let dbDupFinder = []; // a veriable to hold all db types | to find duplicates in request
        let url = ""; // holdes uil string for db

        /** @type {string} */
        let dbRef; // holdes collections name

        if (get) { typeDupFinter.push('get'); }; //                   | ---
        if (getOne) { typeDupFinter.push('getOne'); }; //             | --
        if (getByID) { typeDupFinter.push('getByID'); }; //           | -
        if (setOne) { typeDupFinter.push('setOne'); }; //             | Adds each options that is passed as options to the function to typeDupFinder array
        if (setMany) { typeDupFinter.push('setMany'); }; //           | if the array length is not one that means more or less opteins are passed 
        if (deleteOne) { typeDupFinter.push('gedeleteOnet'); }; //    | then the function will get rejected.
        if (deleteMany) { typeDupFinter.push('deleteMany'); }; //     | --
        if (updateOne) { typeDupFinter.push('updateOne'); }; //       | ---

        if (auth_users) { dbDupFinder.push("auth_users") }; //        | -
        if (auth_sessions) { dbDupFinder.push("auth_sessions") }; //  | same duplication check with db's
        if (projects) { dbDupFinder.push("projects") }; //            | -

        if (dbDupFinder.length == 1) {
            if (auth_users) {
                url = process.env.AUTH_USERS;
                dbRef = "users";
            };
            if (auth_sessions) {
                url = process.env.AUTH_SESSONS;
                dbRef = "session";
            };
            if (projects) { url = process.env.PROJECTS };
        } else {
            reject('DB url err , You can only specify one db at a time !');
        }

        if (typeDupFinter.length == 1) {

            MongoClient.connect(url, (errDb, resultDb) => {

                if (errDb) { reject(errDb); };

                var db = resultDb.db("auth").collection(dbRef);
                var sort = { name: 1 };
                var query;
                var projectionInput
                if (projection) {
                    projectionInput = { projection };
                } else {
                    projectionInput = { projection: {} };
                }

                if (get) {
                    query = get;

                    db.find(query, projectionInput).sort(sort).toArray((err, result) => {
                        if (err) { reject(err); };
                        resolve(result);
                    });

                } else if (getOne) {
                    query = get;

                    db.findOne(query, projectionInput).sort(sort).toArray((err, result) => {
                        if (err) { reject(err); };
                        resolve(result);
                    });

                } else if (getByID) {
                    query = ObjectId(getByID);
                    if (projection) {
                        projectionInput = projection;
                    } else {
                        projectionInput = {
                            projection: { _id: 0 }
                        }
                    }

                    db.find(query, projectionInput).sort(sort).toArray((err, result) => {
                        if (err) { reject(err); };
                        resolve(result);
                    });

                } else if (setOne) {
                    query = setOne;

                    db.insertOne(query, (err, result) => {
                        if (err) { reject(err); };
                        resolve(result);
                    });

                } else if (setMany) {
                    query = setMany;

                    db.insertMany(query, (err, result) => {
                        if (err) { reject(err); };
                        resolve(result);
                    });

                } else if (deleteOne) {
                    query = deleteOne;

                    db.deleteOne(query, (err, result) => {
                        if (err) { reject(err); };
                        resolve(result);
                    });

                } else if (deleteMany) {
                    query = deleteMany;

                    db.deleteMany(query, (err, result) => {
                        if (err) { reject(err); };
                        resolve(result);
                    });

                } else if (updateOne) {
                    query = updateOne.query;
                    let values = updateOne.NewValues;
                    let final = { $set: values };

                    db.updateOne(query, final, (err, result) => {
                        if (err) { reject(err); };
                        resolve(result);
                    });

                }

            });

        } else {
            reject('type must not be more than 1 or less than 1 , must declare one type of function but not more than one ! ');
        }

    });

};



// /* -------------------dev functions------------------ */

export function DbSetDummy() {

    var myobj = [
        { name: 'lol', address: 'lol 71' },
        { name: 'Peter', address: 'Lowstreet 4' },
        { name: 'Amy', address: 'Apple st 652' },
        { name: 'Hannah', address: 'Mountain 21' },
        { name: 'Michael', address: 'Valley 345' },
        { name: 'Sandy', address: 'Ocean blvd 2' },
        { name: 'Betty', address: 'Green Grass 1' },
        { name: 'Richard', address: 'Sky st 331' },
        { name: 'Susan', address: 'One way 98' },
        { name: 'Vicky', address: 'Yellow Garden 2' },
        { name: 'Ben', address: 'Park Lane 38' },
        { name: 'William', address: 'Central st 954' },
        { name: 'Chuck', address: 'Main Road 989' },
        { name: 'Viola', address: 'Sideway 1633' }
    ];

    projects({ setMany: myobj }).then(result => {
        console.log(result);
    });
};

