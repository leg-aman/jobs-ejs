const express = require("express");
const app = express();
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const passport = require("passport");
const passportInit = require("./passport/passportInit");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const hostCsrf = require("host-csrf");
const rateLimit = require("express-rate-limit");
const xss = require("xss-clean");

require("dotenv").config();
require("express-async-errors");

// view engine
app.set("view engine", "ejs");

// body parser
app.use(express.urlencoded({ extended: true }));

// cookie parser
app.use(cookieParser(process.env.SESSION_SECRET));

// security packages
app.use(helmet());
app.use(xss());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
});
app.use(limiter);

// MongoDB session store
const store = new MongoDBStore({
  uri: process.env.MONGO_URI,
  collection: "mySessions",
});

store.on("error", function (error) {
  console.log(error);
});

// session settings
const sessionParms = {
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: store,
  cookie: {
    secure: false,
    sameSite: "strict",
  },
};

if (app.get("env") === "production") {
  app.set("trust proxy", 1);
  sessionParms.cookie.secure = true;
}

app.use(session(sessionParms));

// passport
passportInit();
app.use(passport.initialize());
app.use(passport.session());

// flash + locals
app.use(require("connect-flash")());
app.use(require("./middleware/storeLocals"));

// CSRF
// must come after body parser and cookie parser
// and before routes
app.use(hostCsrf.csrf());

app.use((req, res, next) => {
  res.locals._csrf = hostCsrf.getToken(req, res);
  next();
});

// routes
app.get("/", (req, res) => {
  res.render("index");
});

app.use("/sessions", require("./routes/sessionRoutes"));

const secretWordRouter = require("./routes/secretWord");
const auth = require("./middleware/auth");
app.use("/secretWord", auth, secretWordRouter);

// later you will add jobs routes here
// const jobsRouter = require("./routes/jobs");
// app.use("/jobs", auth, jobsRouter);

// 404
app.use((req, res) => {
  res.status(404).send(`That page (${req.url}) was not found.`);
});

app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).send(err.message);
});

const port = process.env.PORT || 3000;

const start = async () => {
  try {
    await require("./db/connect")(process.env.MONGO_URI);
    app.listen(port, () => {
      console.log(`Server is listening on port ${port}...`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();