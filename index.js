
const Discord = require("discord.js");
const config = require("./config.json");
const fs = require("fs");
const Enmap = require("enmap");

const client = new Discord.Client();
client.commands = new Enmap();

// Eventos
fs.readdir("./events/", (err, files) => {
  if (err) return console.error(err);
  files.forEach(file => {
    const event = require(`./events/${file}`);
    let eventName = file.split(".")[0];
    client.on(eventName, event.bind(null, client));
  });
});

// Comandos
fs.readdir("./comandos/", (err, files) => {
  if (err) return console.error(err);
  files.forEach(file => {
    if (!file.endsWith(".js")) return;
    let props = require(`./comandos/${file}`);
    let commandName = file.split(".")[0];
    console.log(`Attempting to load command ${commandName}`);
    client.commands.set(commandName, props);
  });
});

client.on("message", async message => {
  if (message.author.bot) return;
  if (!message.content.startsWith(config.prefix)) return;
  let args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  let comando = args.shift().toLowerCase();

  const cmd = client.commands.get(comando);
  if (cmd) cmd.run(client, message, args);
});

client.on("guildCreate", guild => {
  console.log(`✅ Entré al servidor: ${guild.name}`);
});

client.login(config.token).catch(() => {
  console.log(`❌ Token inválido ::: [${config.token}]`);
});
