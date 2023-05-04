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

app.use(express.static('resources'))

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
        // const query = `select * from bookings, rooms`;
        
        const query1 = `select * from tableid_to_booked ORDER BY tableid ASC;`;
        db.any(query1)
         .then(function (results){
           console.log('!!!!! RESERVE:', results)
           res.render("pages/home", {
             StudentID: req.session.user.studentid,
             first_name: req.session.user.first_name,
             last_name: req.session.user.last_name,
             email: req.session.user.email,
             bookedinfo: results
            // formid: req.body.formid,
           
           });
         })

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
  const query = 'insert into students (StudentID, first_name, last_name, pwd, email) values ($1, $2, $3, $4, $5)  returning * ;';
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
  
  const query1 = `select * from tableid_to_booked ORDER BY tableid ASC;`;
  db.any(query1)
   .then(function (results){
     console.log('!!!!! RESERVE:', results)
     res.render("pages/home", {
       StudentID: req.session.user.studentid,
       first_name: req.session.user.first_name,
       last_name: req.session.user.last_name,
       email: req.session.user.email,
       bookedinfo: results
      // formid: req.body.formid,
     
     });
   })
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
 

app.get("/reservation", (req, res) =>{
  let nStudentID = req.session.user.studentid;
 let Query = `SELECT * FROM bookings WHERE username = ${nStudentID};`;
 db.any(Query)
 .then((results) => {
  console.log(results[Object.keys(results)[Object.keys(results).length - 1]].chosentime);
  for(let i = 0; i < Object.keys(results).length; i++){
    results[Object.keys(results)[i]].chosentime = numbertoTime(results[Object.keys(results)[i]].chosentime);
    results[Object.keys(results)[i]].chosenroom = numbertoRoom(results[Object.keys(results)[i]].chosenroom);
  }
  
  res.render('pages/reservation', { data: results });
})
 .catch((error) =>{
   console.log("error")
 });

})

app.get("/home", (req, res) => {
  //const query = `select * from rooms;`
  const query1 = `select * from tableid_to_booked ORDER BY tableid ASC;`;
 db.any(query1)
  .then(function (results){
    console.log('!!!!! RESERVE:', results)
    res.render("pages/home", {
      StudentID: req.session.user.studentid,
      first_name: req.session.user.first_name,
      last_name: req.session.user.last_name,
      email: req.session.user.email,
      bookedinfo: results
     // formid: req.body.formid,
    
    });
  })
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
// const query2 = `delete from student_tables where StudentID = ${theStudentID};`
 
 
 db.task('get-everything', task => {
 return task.batch([task.any(query1)]);
 })
 .then(() => {
   req.session.destroy();
   res.redirect('/logout');
 })
 .catch((error) =>{
   console.log(error);
 })
 });
 var tableidl;
 app.post("/updatepassword", (req, res) => {
   const student_id = req.session.user.studentid;
   tableidl = req.query.tableid;
  
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
var tableidl = 1;
app.get("/tableBook", async(req, res) => {
  console.log('gettablebookingcalled')
 console.log(req.query.tableid);
 tableidl = req.query.tableid;


// const RoomName = req.query.roomname;
//const logme = req.

//console.log(logme)


//tableid

  //const querytoaddrooms = `insert into rooms (RoomId, RoomCapacity, RoomName) values (${tableid},5,'${RoomName}') returning *;`;
//  db.one(querytoaddrooms)
//   //db.any(querytoaddrooms)
//   .catch(error =>{
//     console.log(error)
//   })
  // const room_id = req.body.RoomId;
  // const result = `select * from bookings where RoomId = ${room_id};`;
  // db.any(result, [room_id])
  // .then(function(data) {
  //   console.log(data);
  //   if(data.BookingStatus == true){
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
        //console.log(results.data); // the results will be displayed on the terminal if the docker containers are running // Send some parameters
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
    // }
    // else{
    //   res.redirect('/cancelBooking');
    // }
  })

  function timeToNumber(chosenTime) {
    switch (chosenTime) {
      case "8AM-9AM":
        return 1;
      case "9AM-10AM":
        return 2;
      case "10AM-11AM":
        return 3;
      case "11AM-12PM":
        return 4;
      case "12PM-1PM":
        return 5;
      case "1PM-2PM":
        return 6;
      case "2PM-3PM":
        return 7;
      case "3PM-4PM":
        return 8;
      case "4PM-5PM":
        return 9;
      case "5PM-6PM":
        return 10;
      default:
        return null;
    }
  }

  function numbertoTime(chosenTime) {
    switch (chosenTime) {
      case 1:
        return "8AM-9AM";
      case 2:
        return "9AM-10AM";
      case 3:
        return "10AM-11AM";
      case 4:
        return "11AM-12PM";
      case 5:
        return "12PM-1PM";
      case 6:
        return "1PM-2PM";
      case 7:
        return "2PM-3PM";
      case 8:
        return "3PM-4PM";
      case 9:
        return "4PM-5PM";
      case 10:
        return "5PM-6PM";
      default:
        return null;
    }
  }
  
  function numbertoRoom(chosenRoom) {
    switch (chosenRoom) {
      case 1:
        return "114B";
      case 2:
        return "114C";
      case 3:
        return "114D";
      case 4:
        return "114E";
      case 5:
        return "114F";
      case 6:
        return "114G";
      case 7:
        return "114H";
      case 8:
        return "114J";
      default:
        return null;
    }
  }

  app.post("/tableBook", async (req, res) => {

    
    console.log('in post request' ,tableidl);
    const query1 = `update tableid_to_booked set bookedstatus = true where tableid = ${tableidl} returning * ;`;
  
    db.one(query1)
    .then(function (results){
      const query1 = `select * from tableid_to_booked ORDER BY tableid ASC;`;
      db.any(query1)
       .then(function (result){
         console.log('!!!!! RESERVE:', result)
         res.render("pages/home", {
           StudentID: req.session.user.studentid,
           first_name: req.session.user.first_name,
           last_name: req.session.user.last_name,
           email: req.session.user.email,
           bookedinfo: result
          // formid: req.body.formid,
         
         });
       })
    }).catch(error => {
    // Handle errors
    console.log(error);
    res.render("pages/tableBook", {
      results: [],
      error: true,
      message: error.message,
    });
  });

  

    const authClient = new google.auth.JWT(
      credentials.client_email,
      null,
      credentials.private_key.replace(/\\n/g, "\n"),
      ["https://www.googleapis.com/auth/spreadsheets"]
    );
  
    try {
      const token = await authClient.authorize();
      authClient.setCredentials(token);
  
      const response = await service.spreadsheets.values.get({
        auth: authClient,
        spreadsheetId: "1TwXIVkJpL0ezrFLh40nzxzB4KlyRVMEwiVzqUHYZ-K4",
        range: "A:F",
      });
  
      const responses = [];
      const rows = response.data.values;
      if (rows.length) {
        rows.shift();
        for (const row of rows) {
          const timeStamp = row[0];
          const chosenDate = row[5];
          let chosenRoom = row[4];
          let chosenTime = row[3];
          const username = row[1];
          const notes = row[2];
      
          responses.push({timeStamp, chosenDate, chosenRoom, chosenTime, username, notes});
      
          if (chosenRoom && chosenRoom.length >= 4) {
         //   console.log(chosenRoom[3]);
      
            if (chosenRoom[3] == 'B') {
              chosenRoom = 1;
            } else if (chosenRoom[3] == 'C') {
              chosenRoom = 2;
            } else if (chosenRoom[3] == 'D') {
              chosenRoom = 3;
            } else if (chosenRoom[3] == 'E') {
              chosenRoom = 4;
            } else if (chosenRoom[3] == 'F') {
              chosenRoom = 5;
            } else if (chosenRoom[3] == 'G') {
              chosenRoom = 6;
            } else if (chosenRoom[3] == 'H') { 
              chosenRoom = 7;
            } else if (chosenRoom[3] == 'J') {
              chosenRoom = 8;
            }
          }
      
          chosenTime = timeToNumber(chosenTime);

         // console.log(timeStamp, chosenDate, chosenRoom, chosenTime, username, notes);
          // Insert the data into the database.
          const insertQuery = `
            INSERT INTO bookings (timeStamp, chosenDate, chosenRoom, chosenTime, username, notes)
            VALUES ($1, $2, $3, $4, $5, $6);
          `;
         
          // Use an array to hold the values corresponding to the placeholders in the query.
          const values = [timeStamp, chosenDate, chosenRoom, chosenTime, username, notes];
        
          // Execute the query and pass the values array.
          await db.none(insertQuery, values);
        }
        
      } else {
        console.log("No data found.");
      }
              
      
    } catch (error) {
      console.log(error);
      process.exit(1);
    }
  });
  



// LEAVE THIS SHIT...please UwU

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.render("pages/logout");
});


module.exports = app.listen(3000);
console.log("Server is listening on port 3000");