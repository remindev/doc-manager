//Import the express dependency
import express from 'express';
import cors from 'cors';
import expressLayouts from 'express-ejs-layouts';
import { config } from 'dotenv'; config();
import session from 'express-session';
import ConnectMongoDBSession from 'connect-mongodb-session';
const mongodbSesson = ConnectMongoDBSession(session);

import { db } from './db.js';
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

app.get('/usr/:imgPathName', (req, res) => {

  let imgName = req.params.imgPathName;

  if (imgName) {

    if(fs.existsSync(`${__dirname}/publicUserContents/images/${imgName}`)){

      res.sendFile(`${__dirname}/publicUserContents/images/${imgName}`);

    }else{
        res.render("404");
    };

    
  } else {

    res.status(400).send("Bad request");

  };

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
  };

  res.render("login", data);

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


// /* ---------------API'S------------------ */

app.post("/api/auth-login-sign", authTocken, auth, (req, res) => {

  res.send({ "message": "got it done auth" });
  console.log("user IN => " + req.user.data.email);

});

app.post("/api/manage", authMustLogin, (req, res) => {

  updateUserToDb(req)
    .then(resp => {

      res.send({
        response: {
          type: "sucess",
          data: resp
        }
      });

    })
    .catch(err => {

      res.send({
        response: {
          type: "error",
          data: err
        }
      });

    });

});

// ---------- 404 ---------

app.use((req,res,next)=>{

  res.status(404).render("404")

});

// /* ----------------- for development help! ---------------- */
// must remved for producton

// bult.set();
// db.projects({deleteOne:{pid:"_vdQJREkOA"}}).then(res=>{
//   console.log(res);
// })

app.get('/api/view/all', (req, res) => {

  db({ get: {}, auth_users: true }).then(result => {

    res.send(result);
    
  });

});



