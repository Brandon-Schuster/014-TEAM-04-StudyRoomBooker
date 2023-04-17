// delete this line

const express = require("express");
const app = express();
const pgp = require("pg-promise")();
const bodyParser = require("body-parser");
const session = require("express-session");

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
  student_id: undefined,
  username: undefined,
  first_name: undefined,
  last_name: undefined,
  email: undefined,
  year: undefined,
  major: undefined,
  degree: undefined,
};

const student_courses = `
  SELECT DISTINCT
    courses.course_id,
    courses.course_name,
    courses.credit_hours,
    students.student_id = $1 AS "taken"
  FROM
    courses
    JOIN student_courses ON courses.course_id = student_courses.course_id
    JOIN students ON student_courses.student_id = students.student_id
  WHERE students.student_id = $1
  ORDER BY courses.course_id ASC;`;

const all_courses = `
  SELECT
    courses.course_id,
    courses.course_name,
    courses.credit_hours,
    CASE
    WHEN
    courses.course_id IN (
      SELECT student_courses.course_id
      FROM student_courses
      WHERE student_courses.student_id = $1
    ) THEN TRUE
    ELSE FALSE
    END
    AS "taken"
  FROM
    courses
  ORDER BY courses.course_id ASC;
  `;
app.get("/login", (req, res) => {
  res.render("pages/login");
});

// Login submission
// app.post("/login", (req, res) => {
//   const email = req.body.email;
//   const username = req.body.username;
//   const query = "select * from students where students.email = $1";
//   const values = [email];

  // get the student_id based on the emailid
//   db.one(query, values)
//     .then((data) => {
//       user.student_id = data.student_id;
//       user.username = username;
//       user.first_name = data.first_name;
//       user.last_name = data.last_name;
//       user.email = data.email;
//       user.year = data.year;
//       user.major = data.major;
//       user.degree = data.degree;

//       req.session.user = user;
//       req.session.save();

//       res.redirect("/");
//     })
//     .catch((err) => {
//       console.log(err);
//       res.redirect("/login");
//     });
// });

// // Authentication middleware.
// const auth = (req, res, next) => {
//   if (!req.session.user) {
//     return res.redirect("/login");
//   }
//   next();
// };

// app.use(auth);

app.get('/welcome', (req, res) => {
  res.json({status: 'success', message: 'Welcome!'});
});


app.get("/logout", (req, res) => {
  req.session.destroy();
  res.render("pages/logout");
});

module.exports = app.listen(3000);
console.log("Server is listening on port 3000");
