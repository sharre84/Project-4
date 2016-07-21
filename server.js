var
  express = require('express'),
  app = express(),
  bodyParser = require('body-parser'),
  request = require('request'),
  mongoose = require('mongoose'),
  logger = require('morgan'),
  dotenv = require('dotenv').load({silent: true}),
  ejs = require('ejs'),
  ejsLayouts = require('express-ejs-layouts'),
  flash = require('connect-flash'),
  cookieParser = require('cookie-parser'),
  bodyParser = require('body-parser'),
  session = require('express-session'),
  passport = require('passport'),
  passportConfig = require('./config/passport.js'),
  methodOverride = require('method-override'),
  User = require('./models/User.js'),
  aws = require('aws-sdk')

  PORT = process.env.PORT || 3000,
  userRoutes = require('./routes/users.js')

  mongoose.connect('mongodb://localhost/project-4', function(err){
    if (err) return console.log(err);
    console.log("Connected to MongoDB (serviceBook)");
  })

  // middleware
  app.use(bodyParser.json());
  app.use(express.static('./public'))
  app.use(logger('dev'))
  app.use(cookieParser())
  app.use(bodyParser.urlencoded({extended: true}))
  app.use(methodOverride(function(req, res){
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {

      var method = req.body._method
      delete req.body._method
      return method
    }
  }))

  // ejs configuration
  app.set('view engine', 'ejs')
  app.use(ejsLayouts)
  app.use(flash())

  app.use(session({
  cookie: {maxTime: 60000000},
  secret: "seeecret",
  resave: true,
  saveUninitialized: false
}))

app.use(passport.initialize())
app.use(passport.session())

app.use(function(req, res, next) {
  res.locals.user = req.user || null
  next()
})

// app.get('/test-search', function(req, res) {
//   console.log(req);
//   var apiUrl = 'https://api.edmunds.com/api/vehicle/v2/makes?fmt=json&api_key=' + process.env.API_KEY
//   request(apiUrl, function(err, response, body) {
//     res.json(JSON.parse(body))
//   })
// })

app.post('/user/:id/testcar', function(req, res){
  console.log(req.body)
  console.log(req.params.id);
  User.findById(req.params.id, function(err, user){
    if (err) {
      console.log("error inside of testcar");
      return console.log(err)
    }
    console.log("success inside of testcar");
  })
})

app.post('/findcar', function(req, res) {
    console.log(req.body);
    var apiUrl = 'http://api.edmunds.com/api/vehicle/v2/' + req.body.make + '/' + req.body.model + '/' + req.body.year + '/?fmt=json&api_key=' + process.env.API_KEY
    console.log(apiUrl);
    request(apiUrl, function(err, response, body){
    if (err) return console.log(err);
    console.log(body);
    res.json(body)
  })
})

// root route
app.get('/', function(req, res){
  console.log(req.user)
  res.render('landing.ejs', {flash: req.flash('loginMessage')})
})

app.get('/user', function(req,res){
  res.render('index')
})

app.use('/', userRoutes)

app.listen(PORT, function(){
  console.log('Server is running on port: ', PORT);
})


// AMAZON S3
var params;
var S3_BUCKET = process.env.S3_BUCKET

app.get('/sign-s3', function(req, res) {
 var
   s3 = new aws.S3(),
   fileName = req.query['file-name'],
   fileType = req.query['file-type'],
   s3Params = {
     Bucket: S3_BUCKET,
     Key: fileName,
     Expires: 60,
     ContentType: fileType,
     ACL: 'public-read'
   }

   params = {
     Bucket: S3_BUCKET,
     Key: fileName
   }

 s3.getSignedUrl('putObject', s3Params, function(err, data) {
   if(err){
     console.log(err)
     return res.end()
   }
   var returnData = {
     signedRequest: data,
     url: 'https://' + S3_BUCKET + '.s3.amazonaws.com/' + fileName
   }
   res.write(JSON.stringify(returnData));
   res.end();
 })
})
