import { config } from 'dotenv'; config(); // importing emveronmental veriable's
import { initializeApp, applicationDefault } from 'firebase-admin/app'; // firebase admin sdk
import { getAuth } from 'firebase-admin/auth'; // authentication from firebase admin sdk

import { db, userObj } from './db.js'; // databese || mongodb || own Module


// initializing firebase admin sdk
initializeApp({
    credential: applicationDefault()
});

export function authTocken(req, res, next) {

    // This function checks ths JWT || authentication tocken from client after login and gets uid from id .
    // It gets uid from firebase authentication server's.
    // Creates a user if not exist's.
    // Middleware function.

    let idToken = req.body.id; // id tocken from request from client to api

    // gets uif from Id Tocken
    getAuth()
        .verifyIdToken(idToken) // decodes id tocken and gets user id || uid
        .then((decodedToken) => {

            const uid = decodedToken.uid; // the User ID from decoded tocken 

            // get user data by using uid
            getAuth()
                .getUser(uid)
                .then((userRecord) => {

                    var user = userRecord.toJSON(); // user data from UID || user id 

                    // getting user data from database || db and creates one if user not exists 
                    db({ get: { uid: user.uid }, projection: { _id: 0 }, auth_users: true }).then(userFirst => {

                        // this contions runs only currently logginde user exist's on database
                        if (userFirst[0]) {

                            // setting up sessions bj adding onject || user data to request.sessions object
                            req.session.uid = new userObj(userFirst[0]).uid; // user id
                            req.session.device = req.device; // device from logged in || desktop or smartphone || any
                            req.session.device.lastSignIn = new Date; // current date as last signin

                            // updating database of this user to update last sign in date
                            db({
                                updateOne: {
                                    query: { uid: user.uid },
                                    NewValues: { lastSignIn: user.metadata.lastSignInTime }  // setting lastsign in as in firebase user object to database
                                },

                                // initialises current using database
                                auth_users: true

                            }).then(ride => {

                                // movin to next function
                                next();
                            })

                        } else {

                            // this contions runs only currently logginde user not exist's on database

                            db({ // creates a user 
                                setOne: {
                                    img: user.photoURL,
                                    uid: user.uid,
                                    email: user.email,
                                    phone: user.phoneNumber,
                                    name: user.displayName,
                                    disabled: user.disabled,
                                    createdAt: user.metadata.creationTime,
                                    lastSignIn: user.metadata.lastSignInTime,
                                    provider: user.providerData.providerId,
                                    role: "user"
                                },

                                // initialises current using datadase
                                auth_users: true

                            }).then(ride => {

                                // after creating user onject in db || now gets datta of user 
                                db({ get: { uid: user.uid }, auth_users: true }).then(user => {

                                    // settinh up sessions 
                                    req.session.uid = new userObj(user[0]).uid; // user id
                                    req.session.device = req.device; // user device which logged in 
                                    req.session.device.lastSignIn = new Date; // last sign in date 

                                    // moving to next function
                                    next();

                                });

                            });
                        };
                    });

                })
                .catch((error) => {
                    // errors from firebase getting user data from uid

                    // logs it
                    console.log(error);

                });

        })
        .catch((error) => {
            // errors from getting uid from tocken id

            // logs it
            console.log(error);

        });

};

export function auth(req, res, next) {

    // This function checks if user logged in or not.
    // If user is logged in user data is added to request object
    // This is a middleware function.

    req.user = {}; // assining req.user as an object.
    req.user.isLoggedIn = false; // creating is user logged in object and mark's as false
    req.user.data = null; // creating a user data object and defined as null

    // checks if user exists or not 
    if (req.session.uid) {

        // user exists || user logged in

        // getting user data from db || database
        db({ get: { uid: req.session.uid }, auth_users: true }).then(user => {

            req.user.data = new userObj(user[0]); // adding users data to requsest.user object
            req.user.isLoggedIn = true; // declaring user.IsloggedIn function as true

            // moving to next function
            next();
        });

    } else {

        // not logged in 
        // output data of this statement is previsly declared as common

        // moving to next function
        next();

    };

};

export function authMustLogin(req, res, next) {

    // This function checks if user is logged in or not.
    // If logged in it just pass to next function.
    // if not logged in user will be redirected to login page.
    // This is a middleware function.

    if (req.user.isLoggedIn) {
        // User logged in 

        next(); // moving on to next function

    } else {
        // User not logged in

        res.redirect('/login'); // user will be redirected to login page 

    };

};

export function userSessonsByUID(requstAfterAuth) {

    // This functiion is for finding how many existing sessions from current logged in user.
    // There by we can find in how many devices this user is logged in.
    // a session = a user is logged in.

    let uid = requstAfterAuth.user.data.uid; // gets user id from requset
    let sessionId = requstAfterAuth.sessionID; // gets session id from request

    let output = []; // to store output data 

    // retuns a callback promise
    return new Promise((resolve, reject) => {

        // get all sessions from db
        db({ get: {}, auth_sessions: true }).then(sessons => {

            // looping through each session
            sessons.forEach((val, index) => {

                // filtering array to find matching session id
                if (val._id == sessionId) {

                    // create a new object to output value to find the requst is from which device
                    // hence find current device from all logged in device
                    val.session.device.thisDevice = true;

                    // add value to output array
                    // output.push(val);
                };

                // filtering array to find which sessions with maching user id
                if (val.session.uid == uid) {

                    // add value to output array
                    output.push(val);
                };

            });

            // returning output aftering getting how many sessions exists from this user
            resolve(output);

        });

    });

};