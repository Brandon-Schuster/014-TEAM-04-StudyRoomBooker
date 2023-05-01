const express = require("express");
const app = express();
const pgp = require("pg-promise")();
const bodyParser = require("body-parser");
const session = require("express-session");
const path = require("path");
const bcrypt = require('bcrypt');
const axios = require('axios');
const fs = require("fs");
const { google } = require("googleapis");

const service = google.sheets("v4");
const credentials = require("./credentials.json");
const { error } = require("console");

// db config
const dbConfig = {
  host: "db",
  port: 5432,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
};

const db = pgp(dbConfig);

// db test
db.connect()
  .then((obj) => {
    // Can check the server version here (pg-promise v10.1.0+):
    console.log("Database connection successful");
    obj.done(); // success, release the connection;
  })
  .catch((error) => {
    console.log("ERROR:", error.message || error);
  });

// set the view engine to ejs
app.set("view engine", "ejs");
app.set('views', path.join(__dirname, '/src/views'));
app.use(bodyParser.json());

// set session
app.use(
  session({
    secret: "XASDASDA",
    saveUninitialized: true,
    resave: true,
  })
);

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
const user = {
  studentID: undefined,
  first_name: undefined,
  last_name: undefined,
  email: undefined,
  pwd: undefined,
}

app.use(express.static(path.join(__dirname, '/src/resources')));


// ROUTES GO HERE
app.get('/welcome', (req, res) => {
  console.log("here");
  res.json({ status: 'success', message: 'Welcome!' });
});
// LOGIN ROUTES
app.get('/', (req, res) => {
  res.redirect('/login');
});

app.get("/login", (req, res) => {
  res.render('pages/login');
});

// Login submission
app.post('/login', async (req, res) => {
  const studentid = req.body.StudentID;
  const query = `select * from students where StudentID = ${studentid}; `;
  db.one(query)
    .then(async data => {
      //console.log(data)
      const match = await bcrypt.compare(req.body.password, data.pwd);


      if (match) {
        user.first_name = data.first_name;
        user.email = data.email;
        user.last_name = data.last_name;
        user.studentid = data.studentid;
        req.session.user = user;
        req.session.save();
        res.redirect('/home')
      } else {

        res.render("pages/login", {

          error: true,
          message: "Incorrect username or password.",
        });
      }
    })
    .catch(err => {
      // console.log(err)
      // console.log(res.status)

      // no users exist so go to register
      console.log(err.code)
      if (err.code == 42703 || err.code == 0) {
        res.redirect('/register')
      } else {
        res.render("pages/login", {
          message: err.message
        })
      }

    })
})








// REGISTRATION ROUTES

app.get("/register", (req, res) => {
  console.log('register called')
  res.render('pages/register');
});

// CREATE A POST ROUTE HERE TO CREATE A NEW ACC
app.post('/register', async (req, res) => {
  //hash the password using bcrypt library
  const hash = await bcrypt.hash(req.body.password, 10);

  const info = `insert into students (first_name, last_name, email, StudentID, pwd) values ($1, $2, $3, $4, $5);`;

  db.any(info, [req.body.first_name, req.body.last_name, req.body.email, req.body.StudentID, hash])
    .then((data) => {
      user.first_name = req.body.first_name;
      user.email = req.body.email;
      user.last_name = req.body.last_name;
      user.studentid = req.body.StudentID;
      req.session.user = user;
      req.session.save();
      res.redirect('/home')
    })
    .catch((error) => {
      console.log(error);
      res.redirect(404, "/register");
    })
});


app.post('/add_user', async function (req, res) {
  const query =
    'insert into students (StudentID, first_name, last_name, pwd, email) values ($1, $2, $3, $4, $5)  returning * ;';
  db.any(query, [
    req.body.StudentID,
    req.body.first_name,
    req.body.last_name,
    req.body.pwd,
    req.body.email,
  ])
    // if query execution succeeds
    // send success message
    .then(function (data) {
      res.status(200).json({
        data: data,
        message: 'data added successfully',
      });
    })
    // if query execution fails
    // send error message
    .catch(function (err) {
      console.log(err);
      res.status(404).json({message: 'Invalid input'})
    });
});

// Authentication middleware.
const auth = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  next();
};
app.use(auth);

app.get("/", (req, res) => {
  res.render("pages/home", {
    StudentID: req.session.user.studentid,
    first_name: req.session.user.first_name,
    last_name: req.session.user.last_name,
    email: req.session.user.email,
  
  });
});

app.get("/profile", (req, res) => {
  console.log(req.session.user.first_name)
  res.render("pages/profile",{
    StudentID: req.session.user.studentid,
    first_name: req.session.user.first_name,
    last_name: req.session.user.last_name,
    email: req.session.user.email,
    
  });
})

app.get("/home", (req, res) => {
  const taken = req.query.taken;
  res.render("pages/home")
  // Query to list all the courses taken by a student

  // db.any(taken ? student_courses : all_courses, [req.session.user.student_id])
  //   .then((courses) => {
  //     res.render("pages/courses", {
  //       courses,
  //       action: req.query.taken ? "delete" : "add",
  //     });
  //   })
  //   .catch((err) => {
  //     res.render("pages/courses", {
  //       courses: [],
  //       error: true,
  //       message: err.message,
  //     })
  // });
});

app.post("/delete_user", (req,res) => {
  const theStudentID = req.session.user.studentid;
//  console.log('the student id is',theStudentID);
 const query1 = `delete from students where StudentID = ${theStudentID};`
 const query2 = `delete from student_tables where StudentID = ${theStudentID};`
 
 
 db.task('get-everything', task => {
 return task.batch([task.any(query2),task.any(query1)]);
 })
 .then(() => {
   req.session.destroy();
   res.redirect('/logout');
 })
 .catch((error) =>{
   console.log(error);
 })
 });
 app.post("/updatepassword", (req, res) => {
   const student_id = req.session.user.studentid;
  
   const query1 = `select * from students where StudentID = ${student_id}; `; 
   db.one(query1)
 .then(async (data) =>{
    // console.log(data)
     //console.log(req.body.oldpassword)
     const oldpassword = data.pwd;
     const oldpasswordfromuser = req.body.oldpassword;
    // console.log('the old password is from the database is  ', oldpassword, 'and the oldpassword from the user is ', oldpasswordfromuser)
     const newpasswordhashed = await bcrypt.hash(req.body.newpassword, 10);
     const match = await bcrypt.compare(oldpasswordfromuser, oldpassword);
 
    // console.log(match)
   
     if(match) {
  // if the password match update the password
  
  
  const query = `update students set pwd = '${newpasswordhashed}' where StudentID = ${student_id} returning *;`
       db.one(query)
       .then((data) => {
         res.render("pages/profile", {
           StudentID: req.session.user.StudentID,
           first_name: req.session.user.first_name,
           last_name: req.session.user.last_name,
           email: req.session.user.email,
           error: false,
           message: "your password has been successfully updated",
         });
         
 
       }).catch((error) =>{
         console.log(error)
       })
     } else{
       res.render("pages/profile", {
         StudentID: req.session.user.StudentID,
         first_name: req.session.user.first_name,
         last_name: req.session.user.last_name,
         email: req.session.user.email,
         error: true,
         message: "original password is incorrect password not updated",
       });
       
     }
   }).catch((error)=> {
     console.log(error);
   })
 })

app.get("/tableBook", (req, res) => {
  const room_id = req.body.RoomId;
  const result = `select * from bookings where RoomId = ${room_id};`;
  db.any(result, [room_id])
  .then(function(data) {
    console.log(data);
    if(data.BookingStatus == true){
      axios({
        url: `https://docs.google.com/forms/d/e/1FAIpQLSeFQu96i8thKDPh6chmpaRUTuFvAZkUBRhwTlhWmPOA0pC4iw/viewform`,
        method: 'GET',
        dataType: 'json',
        headers: {
          'Accept-Encoding': 'application/json',
        },
        params: {
          apikey: process.env.API_KEY,
          size: 1,
        },
      })
      .then(results => {
        console.log(results.data); // the results will be displayed on the terminal if the docker containers are running // Send some parameters
        res.render("pages/tableBook");
      })
      .catch(error => {
        // Handle errors
        res.render("pages/tableBook", {
          results: [],
          error: true,
          message: error.message,
        });
      });
    }
    else{
      res.redirect('/cancelBooking');
    }
  })
  .catch(error => {
    res.render("pages/home");
  });
});


app.post("/tableBook", (req, res) => {

  res.redirect("/home");
  const authClient = new google.auth.JWT(
    credentials.client_email,
    null,
    credentials.private_key.replace(/\\n/g, "\n"),
    ["https://www.googleapis.com/auth/spreadsheets"]
  );
  
  (async function () {
    try {
        const token = await authClient.authorize();
        authClient.setCredentials(token);
  
        const res = await service.spreadsheets.values.get({
            auth: authClient,
            spreadsheetId: "1TwXIVkJpL0ezrFLh40nzxzB4KlyRVMEwiVzqUHYZ-K4",
            range: "A:E",
        });
  
        const responses = [];
        const rows = res.data.values;
        if (rows.length) {
            rows.shift()
            for (const row of rows) {
                responses.push({ timeStamp: row[0], name: row[1], party_size: row[2], time: row[4], notes: row[3]});
            }
  
        } else {
            console.log("No data found.");  
        }
  
        fs.writeFileSync("answers.json", JSON.stringify(responses), function (err, file) {
            if (err) throw err;
            console.log("Saved!");
        });   
    } catch (error) {

        console.log(error);
        process.exit(1);
  
    }
  })(); 
});

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.render("pages/logout");
});





// LEAVE THIS SHIT...please UwU


module.exports = app.listen(3000);
console.log("Server is listening on port 3000");
