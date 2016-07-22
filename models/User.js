var
  mongoose = require('mongoose'),
  findOrCreate = require('mongoose-findorcreate'),
  bcrypt = require('bcrypt-nodejs'),
  Schema = mongoose.Schema,

  maintenanceSchema = new Schema ({
    what: String,
    when: String,
    price: String,
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

  userSchema.methods.generateHash = function(password){
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8))
  }

  userSchema.methods.validPassword = function(password){
    return bcrypt.compareSync(password, this.local.password)
  }

  var User = mongoose.model('User', userSchema)

  module.exports = User
