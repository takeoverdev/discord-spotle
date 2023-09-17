const discord = require("discord.js");
const fs = require("fs");
const cron = require("node-cron");
const artists = require("./artists.json");
require("dotenv").config();
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_CONNECTION_TOKEN);
const Data = require("./userSchema.js");

module.exports.cronSchedule = cron.schedule(
  "0 0 0 * * *",
  async () => {
    const atRandom = Math.ceil(Math.random() * 300);
    const selectedArtist = artists[atRandom];
    console.log(Date.now(), "TODAY'S Selected artist", selectedArtist.artist, atRandom);
    let publicData = await Data.findOne({ userID: "Public" });
    publicData.game = { artist: `${selectedArtist.artist}`, rounds: 10, participants: [], participantInfo: [] };
    publicData.save().catch((err) => console.log(err));
  },
  {
    scheduled: true,
    timezone: "UTC",
  }
);

const client = new discord.Client({
  intents: [
    discord.GatewayIntentBits.Guilds,
    discord.GatewayIntentBits.GuildMessages,
    // discord.GatewayIntentBits.GuildMembers,
    // discord.GatewayIntentBits.MessageContent,
  ],
});

client.commands = new discord.Collection();

fs.readdir("./commands", (err, files) => {
  if (err) console.log(err);
  files.forEach((file) => {
    let command = require(`./commands/${file}`);
    console.log(file, "loaded!");
    client.commands.set(command.info.name, command);
  });
});

module.exports.clientOn = client.on("ready", () => {
  console.log(`🟢 Running ${client.user.username} in ${client.guilds.cache.size} servers`);
  cron.schedule("0 0 * * * *", () => {
    const atRandom = Math.ceil(Math.random() * artists.length);
    const selectedArtist = artists[atRandom];
    client.user.setPresence({
      activities: [{ name: `${selectedArtist.artist}`, type: discord.ActivityType.Listening }],
    });
  });
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.user.bot) return;

  let userData = await Data.findOne({ userID: interaction.user.id }).catch((err) => console.log(err));
  let newUser = false;
  const welcomeEmbed = new discord.EmbedBuilder();
  if (!userData) {
    newUser = true;
    var newData = new Data({
      userID: interaction.user.id,
      username: interaction.user.username,
      timestamp: Date.now(),
      publicWins: 0,
      customWins: 0,
      totalGuesses: 0,
    });
    newData.save().catch((err) => console.log(err));
    userData = newData;
    welcomeEmbed.setTitle(`Welcome to Spotle, ${interaction.user.username}!`);
    welcomeEmbed.setColor("#1ED760");
    welcomeEmbed.setDescription(`The music-oriented Wordle type game! 
    Create custom games for your friends to guess your selected mystery artist and participate in a public game with a random mystery artist generated each day. 
    Once you guess, you will be prompted with how close you were to the mystery artist. 
    Create custom games and challenge your friends to guess your selected artist! 
    Participate in Today's randomly selected mystery artist: </public:1149454927047950491>
    Then guess the artist using: </guess:1149454927047950489>
    Instead, you can create your own custom game to play with your friends using: </custom:1149454927047950487>, and they can join using </join:1149454927047950488>`);
  }

  const command = interaction.client.commands.get(interaction.commandName);
  if (!command) {
    return console.log("No command with " + interaction.commandName + " found");
  }
  try {
    await command.execute(interaction);
    if (newUser) interaction.followUp({ embeds: [welcomeEmbed], ephemeral: true });
  } catch (err) {
    console.log(err);
  }
});

process.env.TEST_ENVIRONMENT === "TRUE" ? client.login(process.env.TEST_TOKEN) : client.login(process.env.TOKEN);
