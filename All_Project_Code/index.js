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
