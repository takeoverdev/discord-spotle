// const discord = require("discord.js");
const { REST, Routes } = require("discord.js");
require("dotenv").config();

const commands = [
  {
    name: "custom",
    description: "Start a custom game of Spotle",
    options: [
      {
        name: "artist",
        description: "Select an artist",
        type: 3,
        required: true,
      },
      {
        name: "rounds",
        description: "Number of guesses allowed",
        type: 4,
        required: false,
      },
    ],
  },
  {
    name: "join",
    description: "Join someone's game of Spotle",
    options: [
      {
        name: "user",
        description: "Mention a user",
        type: 6,
        required: true,
      },
    ],
  },
  {
    name: "guess",
    description: "Guess an answer to the game you're in",
    options: [
      {
        name: "artist",
        description: "Select an artist",
        type: 3,
        required: true,
      },
    ],
  },
  {
    name: "clear",
    description: "Clear your Spotle game",
  },
  {
    name: "public",
    description: "Participate in guesing today's mystery artist",
  },
  {
    name: "help",
    description: "Displays information and guidance about Spotle",
  },
];

let rest;
let clientID;
if (process.env.TEST_ENVIRONMENT === "TRUE") {
  rest = new REST({ version: 10 }).setToken(process.env.TEST_TOKEN);
  clientID = "1152673623325294602";
} else {
  rest = new REST({ version: 10 }).setToken(process.env.TOKEN);
  clientID = "605158899506610220";
}

(async () => {
  try {
    console.log("Started to refresh slash commands");
    // const data = await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.DEV_GUILD), {
    // body: commands,
    // });
    const data = await rest.put(Routes.applicationCommands(clientID), {
      body: commands,
    });
    console.log("Successfully refreshed slash commands");
  } catch (err) {
    console.log(err);
  }
})();
