const { model, Schema } = require("mongoose");

const dataSchema = Schema({
  userID: String,
  username: String,
  timestamp: String,
  publicWins: Number,
  customWins: Number,
  totalGuesses: Number,
  game: {
    artist: String,
    rounds: Number,
    roundsUsed: Number,
    channel: String,
    participants: Array,
    participantInfo: [
      {
        userID: String,
        roundsUsed: Number,
        won: Boolean,
      },
    ],
  },
});

module.exports = model("Data", dataSchema);
