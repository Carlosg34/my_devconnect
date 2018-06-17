const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create profile schema---Associate user using user id
const ProfileSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "users"
  },
  handle: {
    type: String,
    required: true,
    max: 20
  },
  occupation: {
    type: String
  },
  social: {
    linkedin: {
      type: String
    },
    instagram: {
      type: String
    },
    tweeter: {
      type: String
    },
    facebook: {
      type: String
    }
  },
  bio: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = Profile = mongoose.model("profile", ProfileSchema);
