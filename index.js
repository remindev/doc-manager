//Import the express dependency
import express from 'express';
import cors from 'cors';
import expressLayouts from 'express-ejs-layouts';
import { config } from 'dotenv'; config();
import session from 'express-session';
import ConnectMongoDBSession from 'connect-mongodb-session';
const mongodbSesson = ConnectMongoDBSession(session);

import { db, userObj } from './db.js';
import { authTocken, auth, authMustLogin, userSessonsByUID } from './auth.js';
import { dateToReadable, updateUserToDb, deviceLayout } from './functions.js';
import { folderCheck, fs } from './files.js';

// initializing express
const app = express();

//requried consts
const port = 5000;
const __dirname = process.cwd();
const appDetails = {
  name: "REMINZ",
  version: "1.0",
};

//sessioins and cookie
app.use(session({
  secret: process.env.SESSION_SECRET_STRING,
  resave: false,
  saveUninitialized: false,
  store: new mongodbSesson({
    uri: process.env.AUTH_SESSONS,
    collection: "session"
  }),
  cookie: {
    maxAge: 60 * 60 * 24 * 10 * 1000 // session and cookie will valid last for 10 days 
  }
}));

// device detection from user agent
app.use(deviceLayout);

// getting user every requst 
app.use(auth);

// enabling cross orgin requests
app.use(cors());

// to parse data from html body
app.use(express.json());

//static pages
app.use(express.static('public'));
app.use('/profile', express.static(` ${__dirname}/profile`));

//ejs & ejs-templates
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', `${__dirname}/views/base/base-c`); // sets defalt layout Higher chances to get removed in future

// server listening /-- more good if its at the end ! --/
app.listen(port, () => {
  console.log(`Now listening on port ${port}`);
});





// /* -------------common routes------------- */

app.get('/', (req, res) => { // this rout is under progress

  let id = req.query.pages;

  let data = { // -- output data config --
    layout: req.device.layout,
    device: req.device.device,
    title: appDetails.name + ` v` + appDetails.version,
    currentPage: "home",
    data: []
  };

  data.data = ["Hello", "Hai", "Hoi", "Aloo", "Aai", "Ooi", "Kooi"];

  res.send(req.device.device);

  if (req.user.isLoggedIn) {
    console.log(`GOT A REQUEST FROM UESR => ${req.user.data.email} `);
  } else {
    console.log(`GOT A REQUEST FROM UNAUTHERISED MACHINE !`);
  }
  // res.render('home' , data); // rendering page with data

});



app.get("/login", (req, res) => {

  let data = { // -- output data config --
    layout: req.device.layout,
    device: req.device.device,
    title: appDetails.name + ` v` + appDetails.version,
    currentPage: "login",
    data: []
  };

  data.allowed = [];

  if (req.user.isLoggedIn) {
    res.redirect("/");
  } else {
    console.log(`GOT A REQUEST FROM UNAUTHERISED MACHINE !`);

    res.render("login", data);

  };

});


app.get('/manage', authMustLogin, (req, res) => {


  let pageView = req.query.pg;

  if (!pageView) {
    res.redirect("/manage?pg=account");
  } else {

    let data = { // -- output data config --
      layout: req.device.layout,
      device: req.device.device,
      title: appDetails.name + `-v` + appDetails.version,
      currentPage: "login",
      data: [],
      user: req.user.data,
      session: req.session,
      view: pageView
    };

    if(data.user.img){
      let path = `${__dirname}/publicUserContents/images/${data.user.img.split("/")[2]}`;
      data.user.img = `data:image/png;base64,${fs.readFileSync(path,'base64')}`;
    }

    dateToReadable(req.user.data.createdAt).then(redable => {
      data.user.createdAt = redable;

      userSessonsByUID(req).then(users => {

        data.session = users;

        res.render("manageUser", data);

      }).catch(err => {
        console.log(err);
      });

    }).catch(err => {
      console.log(err);
    });

  };

});


// this function serves public files of users | mainly image 
// this function dosn't need login
app.get('/usr/:imgPathName', (req, res) => {

  // getting image name from request
  let imgName = req.params.imgPathName;

  // checks if the file mentioned in name parameter exist's on the public folder 
  if (fs.existsSync(`${__dirname}/publicUserContents/images/${imgName}`)) {
    // runs if file exists 

    // send's the file
    res.sendFile(`${__dirname}/publicUserContents/images/${imgName}`);

  } else {
    // runs if file not exist's

    // sends a not found response 
    res.render("404");

  };

});


// /* ---------------API'S------------------ */

// this api post request handles auth 
// this is the function that signin users 
app.post("/api/auth-login-sign", authTocken, auth, (req, res) => {

  // there is no other function here because the midlle ware added to this contains function nessasery for login and authentication
  // hence this function runs afer login is complete

  // sends login sucess login message
  res.send({ "message": "login sucess" });

  // logs new user email to the console
  console.log("user IN => " + req.user.data.email);

});

// this post request handles manage user api
// thsi function is responsible to change user values like name,bio,dob... etc..
app.post("/api/manage", authMustLogin, (req, res) => {

  // this api is only avilable to logged in users
  // ("...", authMustLogin ,(..)=>{}) is were we check user is logged in or not

  // requst is end to user data update function
  updateUserToDb(req)
    .then(resp => {
      // update sucess fully....

      // sends response with sucess message
      res.send({
        response: {
          type: "sucess",
          data: resp.first,
          resp: resp.second
        }
      });

    })
    .catch(err => {
      // err while updating users data....

      // sends response with err message
      res.send({
        response: {
          type: "error",
          data: err
        }
      });

    });

});


// ---------- 404 ---------

// 404 not found page is renderd from here 
// this middle ware must be after all routs so requests made to last without responce will be considerde as 404
// any middle ware after this will became not usable becaue at this stage this sents 404 custom page
app.use((req, res, next) => {

  // renders custom 404 err page
  res.status(404).render("404");

});

// /* ----------------- for development help! ---------------- */
// must remved for producton

app.get('/api/view/all', (req, res) => {

  db({ get: {}, auth_users: true }).then(result => {

    res.send(result);

  });

});



