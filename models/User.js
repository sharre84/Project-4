var
  mongoose = require('mongoose'),
  findOrCreate = require('mongoose-findorcreate'),
  bcrypt = require('bcrypt-nodejs'),
  Schema = mongoose.Schema,
  // carSchema = new Schema ({
  //   make: String,
  //   model: String,
  //   year: Number,
  //   created_at: Date
  // })

  maintenanceSchema = new Schema ({
    what: String,
    when: String,
    price: Number,
    receipt: String,
    created_at: Date
  })

  userSchema = new Schema({
    local: {
      name: String,
      email: String,
      password: String
    },
    car: String,
    maintenanceHistory: [maintenanceSchema]
})

userSchema.plugin(findOrCreate)

// carSchema.pre('save', function(next){
//   if (!this.created_at) {
//     var current_date = new Date("June 29, 2016 11:13:00")
//     this.created_at = current_date
//   }
//   next()
// })

userSchema.methods.generateHash = function(password){
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8))
}

userSchema.methods.validPassword = function(password){
  return bcrypt.compareSync(password, this.local.password)
}

var User = mongoose.model('User', userSchema)

module.exports = User
