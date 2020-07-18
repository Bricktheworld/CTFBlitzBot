const https = require("https");
const Discord = require("discord.js");

const client = new Discord.Client();
const schedule = require("node-schedule");

client.on("ready", () => {
  console.log("I am ready!");
});

client.on("message", (message) => {
  if (message.content === "!arcade") {
    getArcadeModes(message);
  } else if (message.content === "!test-ctfblitz") {
    isCTFBlitzIn(true);
  }
});

function getArcadeModes(message) {
  https
    .get("https://overwatcharcade.today/api/overwatch/today", (resp) => {
      let data = "";

      // A chunk of data has been recieved.
      resp.on("data", (chunk) => {
        data += chunk;
      });

      // The whole response has been received. Print out the result.
      resp.on("end", () => {
        //   console.log("got data " + data)
        let modes = [];
        data = JSON.parse(data).modes;
        Object.keys(data).forEach((value) => {
          modes.push(data[value].name);
        });
        let formattedModes = modes.map((e) => " " + e);
        message.reply("Current modes for today are:" + formattedModes);
      });
    })
    .on("error", (err) => {
      console.log("Error: " + err.message);
    });
}

function isCTFBlitzIn(notifyIfnotIn = false) {
  https
    .get("https://overwatcharcade.today/api/overwatch/today", (resp) => {
      let data = "";

      // A chunk of data has been recieved.
      resp.on("data", (chunk) => {
        data += chunk;
      });

      // The whole response has been received. Print out the result.
      resp.on("end", () => {
        //   console.log("got data " + data)
        let ids = [];
        let currentModes = JSON.parse(data).modes;
        Object.keys(currentModes).forEach((value) => {
          ids.push(currentModes[value].id);
        });
        console.log(ids);
        https.get(
          "https://overwatcharcade.today/api/overwatch/arcademodes",
          (resp) => {
            let chunks = "";
            resp.on("data", (chunk) => {
              chunks += chunk;
            });
            resp.on("end", () => {
              let ctfBlitzMode;
              chunks = JSON.parse(chunks);
              Object.keys(chunks).forEach((value) => {
                if (chunks[value].name === "CTF Blitz") {
                  ctfBlitzMode = chunks[value].id;
                }
              });
              if (ids.includes(ctfBlitzMode)) {
                client.channels.cache
                  .get("688181231707488266")
                  .send(
                    "<@&689571428177281049> CTF Blitz is in! Time to troll"
                  );
              } else if (notifyIfnotIn) {
                client.channels.cache
                  .get("688181231707488266")
                  .send(
                    "<@&689571428177281049> Someone is sneaky and found out how to make the bot ping everyone"
                  );
              }
            });
          }
        );
      });
    })
    .on("error", (err) => {
      console.log("Error: " + err.message);
    });
}

var rule = new schedule.RecurrenceRule();
rule.hour = 17;
rule.minute = 10;

var j = schedule.scheduleJob(rule, () => {
  console.log("checking for ctf blitz");
  isCTFBlitzIn();
});

const prompt = require("prompt");
prompt.start();

prompt.get(["token"], (err, result) => {
  client.login(result.token);
});
