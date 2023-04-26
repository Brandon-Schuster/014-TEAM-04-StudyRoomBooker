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
  StudentID: undefined,
  first_name: undefined,
  last_name: undefined,
  email: undefined,
  pwd: undefined,
}




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
      console.log(data)
      const match = await bcrypt.compare(req.body.password, data.pwd);


      if (match) {
        user.studentid = req.body.StudentID
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
      if (err.code == 42703) {
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
  res.render('pages/register');
});

// CREATE A POST ROUTE HERE TO CREATE A NEW ACC
app.post('/register', async (req, res) => {
  //hash the password using bcrypt library
  const hash = await bcrypt.hash(req.body.password, 10);

  const info = `insert into students (first_name, last_name, email, StudentID, pwd) values ($1, $2, $3, $4, $5);`;

  db.any(info, [req.body.first_name, req.body.last_name, req.body.email, req.body.StudentID, hash])
    .then((data) => {
      console.log(data);
      res.redirect(200, "/login");
      // res.status(200).json({
      //   data: data,
      //   message: 'data added successfully',
      // });
    })
    .catch((error) => {
      console.log(error);
      res.redirect(404, "/register");
    })
});




app.post('/add_user', function (req, res) {
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
    StudentID: req.session.user.StudentID,
    first_name: req.session.user.first_name,
    last_name: req.session.user.last_name,
    email: req.session.user.email,
    pwd: req.session.user.pwd,
  });
});

app.get("/profile", (req, res) => {
  res.render("pages/profile")
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



app.get("/tableBook", (req, res) => {
  // res.render("pages/tableBook");
  axios({
    url: `https://docs.google.com/forms/d/e/1FAIpQLSeFQu96i8thKDPh6chmpaRUTuFvAZkUBRhwTlhWmPOA0pC4iw/viewform`,
    method: 'GET',
    dataType: 'json',
    headers: {
      'Accept-Encoding': 'application/json',
    },
    params: {
      apikey: process.env.API_KEY,
      // keyword: 'Phoenix', //you can choose any artist/event here
      size: 1,
    },
  })
  
  .then(results => {
    console.log(results.data); // the results will be displayed on the terminal if the docker containers are running // Send some parameters
    res.render("pages/tableBook");
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
              range: "A:D",
          });
    
          const responses = [];
    
          // Set rows to equal the rows
          const rows = res.data.values;
    
          // IF we have data
          if (rows.length) {
    
              // Remove the first row (headers)
              rows.shift()
    
              // For each row
              for (const row of rows) {
                  responses.push({ timeStamp: row[0], answer: row[1] });
              }
    
          } else {
              console.log("No data found.");  
          }
    
          // Saved the answers
          fs.writeFileSync("answers.json", JSON.stringify(responses), function (err, file) {
              if (err) throw err;
              console.log("Saved!");
          });   
      } catch (error) {
    
          // Log the error
          console.log(error);
    
          // Exit the process with error
          process.exit(1);
    
      }
    
    })();
  })
  .catch(error => {
    // Handle errors
    res.render("pages/tableBook", {
      results: [],
      error: true,
      message: error.message,
    });
  });
});


// app.post("/tableBook", (req, res) => {
  
// });

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.render("pages/logout");
});





// LEAVE THIS SHIT...please UwU


module.exports = app.listen(3000);
console.log("Server is listening on port 3000");
