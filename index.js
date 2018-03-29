require('dotenv').config();
const express = require('express')
const session = require('express-session');
const passport = require('passport');
const Auth0Strategy = require('passport-auth0');
let students = require('./students.json');

// 1. import everything from .env
const { 
  SESSION_SECRET,
  PORT,
  DOMAIN,
  CLIENT_ID,
  CLIENT_SECRET,
  callback_URL
 } = process.env;

const app = express();

// 2. setup session
app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: SESSION_SECRET
}));

// 3. Initialize passport and configure it to use sessions
app.use(passport.initialize());
app.use(passport.session());

// 4. Getting secret info-s from auth0 account
passport.use(new Auth0Strategy({ //often called strategy
  domain: DOMAIN,
  clientID: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
  callbackURL: callback_URL,
  scope: 'opened email profile'
}, (accessToken, refreshToken, extraParams, profile, done) => {
  return done(null, profile);
}));

// serializeUser determines, which data of the user object should be stored in the session
// The result of the serializeUser method is attached to the session as req.session.passport.user = {}.
passport.serializeUser((user, done) => {
  done(null, { clientID: user.id, email: user._json.email, name: user._json.name }); // 
});

// The first argument of deserializeUser corresponds to the key of the user object that was given to the done function
// So your whole object is retrieved with help of that key
// In deserializeUser that key is matched with the in memory array / database or any data resource.
// The fetched object is attached to the request object as req.user
passport.deserializeUser((obj, done) => {
  done(null, obj);
});

app.get('/login', passport.authenticate('auth0', {
   successRedirect: '/students', 
   failureRedirect: '/login', connection: 'github' 
}));

const authenticated = (req, res , next) => {
  console.log(req.user)
  if (req.user) {
    next();
  } else {
    res.sendStatus(401);
  }
}

app.get('/students', authenticated, (req, res) => {
  res.status(200).send(students);
})

app.listen( PORT, () => { console.log(`Server listening on port ${PORT}`); } );



// ===========================================================

// const express = require('express');
// const session = require('express-session');
// const passport = require('passport');
// const Auth0Strategy = require('passport-auth0');
// const students = require('./students.json');
// require('dotenv').config()

// const app = express();
// app.use( session({
//   secret: '@nyth!ng y0u w@nT',
//   resave: false,
//   saveUninitialized: false
// }));

// app.use( passport.initialize() );
// app.use( passport.session() );
// passport.use( new Auth0Strategy({
//   domain:       process.env.DOMAIN,
//   clientID:     process.env.CLIENT_ID,
//   clientSecret: process.env.CLIENT_SECRET,
//   callbackURL:  '/login',
//   scope: "openid email profile"
//  },
//  function(accessToken, refreshToken, extraParams, profile, done) {
//    // accessToken is the token to call Auth0 API (not needed in the most cases)
//    // extraParams.id_token has the JSON Web Token
//    // profile has all the information from the user
//    return done(null, profile);
//  }
// ) );

// passport.serializeUser( (user, done) => {
//   done(null, { clientID: user.id, email: user._json.email, name: user._json.name });
// });

// passport.deserializeUser( (obj, done) => {
//   done(null, obj);
// });

// app.get( '/login',
//   passport.authenticate('auth0', 
//     { successRedirect: '/students', failureRedirect: '/login', connection: 'github' }
//   )
// );

// function authenticated(req, res, next) {
//   if( req.user ) {
//     next()
//   } else {
//     res.sendStatus(401);
//   }
// })

// app.get('/students', authenticated, ( req, res, next ) => {
//   res.status(200).send(students)
// });

// const port = 3000;
// app.listen( port, () => { console.log(`Server listening on port ${port}`); } );