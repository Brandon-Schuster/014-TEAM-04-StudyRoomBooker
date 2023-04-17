// delete this line

const express = require("express");
const app = express();
const pgp = require("pg-promise")();
const bodyParser = require("body-parser");
const session = require("express-session");
const path = require("path");


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
app.set('views',path.join(__dirname, '/src/views'));
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



app.get('/', (req, res) => {
  res.redirect('/login');
});

app.get("/login", (req, res) => {
  res.render('pages/login');
});

// Login submission
app.post("/login", (req, res) => {
  const email = req.body.email;
  const username = req.body.username;
  const query = "select * from students where students.email = $1";
  const values = [email];

  // get the student_id based on the emailid
  db.one(query, values)
    .then((data) => {

      // students.StudentId = data.StudentId;
      // students.first_name = data.first_name;
      // students.last_name = data.last_name;
      // students.email = data.email;
      // students.pwd = data.pwd;

      // req.session.students = students;
      req.session.save();

      res.redirect("/");
    })
    .catch((err) => {
      console.log(err);
      res.redirect("/login");
    });
});

// Authentication middleware.
const auth = (req, res, next) => {
  if (!req.session.student) {
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

app.get("/home", (req, res) => {
  const taken = req.query.taken;
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



app.get("/logout", (req, res) => {
  req.session.destroy();
  res.render("pages/logout");
});









app.get("/register", (req, res) => {
  res.render('pages/register');
});





// LEAVE THIS SHIT...please UwU
app.get('/welcome', (req, res) => {
  res.json({status: 'success', message: 'Welcome!'});
});

module.exports = app.listen(3000);
console.log("Server is listening on port 3000");
