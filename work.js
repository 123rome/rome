const Discord = require("discord.js");
const tf = require('@tensorflow/tfjs'); // Asegúrate de tenerlo instalado con tfjs-node
const db = require("megadb");

let MoneyDB = new db.crearDB("Economy");
const cooldown = new Set(); // Cooldown global por usuario

exports.run = async (client, message, args) => {
  // 📛 Controlar el cooldown
  if (cooldown.has(message.author.id)) {
    return message.reply("⏳ Debes esperar 10 segundos antes de volver a trabajar.");
  } else {
    cooldown.add(message.author.id);
    setTimeout(() => cooldown.delete(message.author.id), 10000); // 10 segundos
  }

  // 📥 Validar entrada del número de días
  const dias = parseInt(args[0]);
  if (isNaN(dias) || dias <= 0) {
    return message.reply("❌ Debes ingresar un número de días de huelga. Ejemplo: `!work 5`");
  }

  // 📊 Datos de entrenamiento para la red neuronal (días vs pérdida estimada)
  const xs = tf.tensor1d([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  const ys = tf.tensor1d([100, 220, 330, 480, 590, 700, 810, 960, 1050, 1200]);

  // 🧠 Crear y entrenar el modelo de predicción
  const model = tf.sequential();
  model.add(tf.layers.dense({ units: 1, inputShape: [1] }));
  model.compile({ loss: "meanSquaredError", optimizer: "sgd" });
  await model.fit(xs, ys, { epochs: 250, verbose: 0 });

  // 📈 Predecir pérdida económica
  const input = tf.tensor2d([dias], [1, 1]);
  const prediccion = await model.predict(input).data();
  const perdida = Math.round(prediccion[0]);

  // 💼 Trabajo aleatorio + ganancia
  const trabajos = ["Minero", "Streamer", "Médico", "Maestro", "Ingeniero"];
  const elegido = trabajos[Math.floor(Math.random() * trabajos.length)];
  const ganancia = Math.floor(Math.random() * 300) + 100;

  // 💾 Registrar ganancia
  if (!MoneyDB.tiene(`${message.author.id}`)) {
    await MoneyDB.establecer(`${message.author.id}`, { coins: 0 });
  }
  await MoneyDB.sumar(`${message.author.id}.coins`, ganancia);

  // 📤 Responder con un embed informativo
  const embed = new Discord.MessageEmbed()
    .setTitle("💼 Comando de Trabajo")
    .setColor("BLUE")
    .setDescription(`👷‍♂️ Trabajaste como **${elegido}** y ganaste 💰 **${ganancia} rubis**`)
    .addField("📉 Predicción por huelga:", `🗓️ Días: **${dias}**\n💸 Pérdida estimada: **${perdida} rubis**`)
    .setFooter(message.author.username, message.author.displayAvatarURL())
    .setTimestamp();

  message.channel.send(embed);
};
