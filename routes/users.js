var
  express = require('express'),
  passport = require('passport'),
  User = require('../models/User.js'),
  userRouter = express.Router(),
  date = new Date


  userRouter.route('/users/:id/maintlog')
	.post(function(req, res){
    User.findOne({_id: req.params.id}, function(err, user){
      console.log(req.body)
      console.log('user', user)
      if(err) return console.log(err)
      user.maintenanceHistory.push(req.body)
      user.save(function(err, user){
        if(err) return console.log(err)
        res.json(user)
      })
    })
  })
  .get(function(req, res){
    User.findOne({_id: req.params.id}, function(err, user){
      if(err) return console.log(err)
      res.json(user)
  })
})

  userRouter.route('/login')
  .get(function(req, res){
    res.render('login', {flash: req.flash('loginMessage')})
  })
  .post(passport.authenticate('local-login',{
    successRedirect: '/main',
    failureRedirect: '/login'
  }))

  userRouter.route('/signup')
  .get(function(req, res){
    res.render('signup', {flash: req.flash('signupMessage')})
  })
  .post(passport.authenticate('local-signup',{
    successRedirect: '/main',
    failureRedirect: '/signup'
  }))


  userRouter.get('/profile', isLoggedIn, function(req, res){
    console.log("Inside of profile");
    console.log(req.query);
    res.render('profile', {user: req.user, strategy: req.query.strategy})
  })

  userRouter.get('/user/:id', function(req, res){
    User.findById(req.params.id, function(err, user){
      res.render('update', {user: user})
    })
  })

  userRouter.patch('/user/:id', function (req, res){
    console.log(req.body);
    User.findByIdAndUpdate(req.params.id, req.body, {new: true}, function(err, user){
      if(err) console.log(err)
      res.redirect('/profile')
    })
  })

  userRouter.patch('/user/:id/setcar', function(req, res) {
    console.log(req.query.car)
    User.findByIdAndUpdate(req.params.id, {car: req.query.car}, {new: true}, function(err, user){
      if(err) console.log(err)
      res.json({message: "Setting user's car...", user: user })
    })
  })

  userRouter.get('/user/:id/delete', function(req, res){
    req.logout()
    User.findByIdAndRemove(req.params.id, function(err, item){
      if (err) throw err;
      res.redirect("/")
    })
  })

  userRouter.get('/logout', function(req, res) {
    req.logout()
    res.redirect('/')
  })

  userRouter.route('/users/:id/maintlog/:serviceId')
  .delete(function(req, res){
  User.findById(req.params.id, function(err, user){
    if (err) return console.log(err);
    if (user.maintenanceHistory.id(req.params.serviceId)) {
      var item = user.maintenanceHistory.id(req.params.serviceId);
      item.remove()
      user.save(function(err){
        if (err) return console.log(err);
      })
      res.json({message: 'deleted item successfully', user: user})
    }
  })
})

  userRouter.get('/main', isLoggedIn, function(req, res){
    res.render('main_page.ejs', {date: date})
  })

  function isLoggedIn(req, res, next) {
  if(req.isAuthenticated()) return next()
  res.redirect('/')
  }

module.exports = userRouter
