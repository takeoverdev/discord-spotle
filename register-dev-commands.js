// const discord = require("discord.js");
const { REST, Routes } = require("discord.js");
require("dotenv").config();

const commands = [
  {
    name: "set-presence",
    description: "Alter the bot's presence",
    options: [
      {
        name: "value",
        description: "value",
        type: 3,
        required: true,
      },
    ],
  },
  {
    name: "eval",
    description: "Evaluates JavaScript code and executes it",
    options: [
      {
        name: "code",
        description: "code",
        type: 3,
        required: true,
      },
    ],
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
    const data = await rest.put(Routes.applicationGuildCommands(clientID, process.env.DEV_GUILD), {
      body: commands,
    });
    // const data = await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
    // body: commands,
    // });
    console.log("Successfully refreshed slash commands");
  } catch (err) {
    console.log(err);
  }
})();
