const fs = require("node:fs");
const Discord = require("discord.js");
const { DOMParser } = require("xmldom");
const { JSDOM } = require("jsdom");
const fetch = require("node-fetch");
const axios = require("axios");
const { EmbedBuilder } = require("discord.js");

module.exports = { statupdate };

function statupdate(client) {
	// Berechnen der Zeit, bis die Funktion ausgeführt werden soll
	const now = new Date();
	millisUntil =
		new Date(
			now.getFullYear(),
			now.getMonth(),
			now.getDate(),
			14, // 4 Uhr
			1, // 0 Minuten
			0, // 0 Sekunden
			0 // 0 Millisekunden
		) - now;
	if (millisUntil < 0) {
		millisUntil += 86_400_000;
	}

	console.log(millisUntil);
	// Setzen des Intervalls, um die Funktion um die Uhrzeit auszuführen
	const intervalId = setInterval(() => {
		refresh(client);
		statupdate(client);
	}, millisUntil);

	// Stoppen des Intervalls, nachdem die Funktion ausgeführt wurde
	setTimeout(() => {
		clearInterval(intervalId);
	}, millisUntil);
}

async function refresh(client) {
	fs.access("idlist.json", fs.constants.F_OK, (error) => {
		if (error) {
			console.log("Error occurred while reading JSON file:", err);
		} else {
			fs.readFile("idlist.json", "utf8", async function (error_, jsonContent) {
				if (error_) {
					console.log("Error occurred while reading JSON file:", error_);
					return;
				}

				let idlist = [];
				idlist = JSON.parse(jsonContent);
				console.log(idlist.length);
				idlength = idlist.length;
				//idlist[idlength][0] = message;
				//idlist[idlength][1] = url;

				for (i = 0; i < idlength; i++) {
					messageobject = idlist[i][0];
					url = idlist[i][1];
					// Neue Embed erstellen
					const title = (await getsquadname(url)) + " ";
					const statact = (await getstatact(url)) + " ";
					const statcount = (await getstatcount(url)) + " ";

					const newEmbed = new Discord.MessageEmbed()
						.setColor("0x0099FF")
						.setTitle(title)
						.setURL(url)
						.addFields(
							{ name: "Kampfgruppenaktivität", value: statact, inline: true },
							{ name: "Spielerzahl", value: statcount, inline: true }
						)
						.setTimestamp();

					try {
						const message = await client.channels.cache
							.get(await messageobject.channelId)
							.messages.fetch(await messageobject.id);
					} catch {
						// Nachrichten-ID existiert nicht
						console.log(`Nachricht existiert nicht.`);
						idlist.splice(i, 1);
						i--;
						idlength--;
						stringlist = JSON.stringify(idlist);
						fs.writeFile("idlist.json", stringlist, "utf8", function (error_) {
							if (error_) {
								console.log("Error occurred while updating JSON file:", error_);
								return;
							}

							console.log("JSON file has been updatet.");
							if ((idlist = [])) {
								fs.unlink("idlist.json", (err) => {
									if (err) throw err;
									console.log("Die idlist war leer wurde gelöscht!");
								});
							}
						});
						return;
					}
					message.edit({ embeds: [newEmbed] });
				}
			});
		}
	});
}

async function getsquadname(url) {
	const html = await geturldoc(url);
	const dom = new JSDOM(html);
	const element = dom.window.document.querySelector(
		"#squadronsInfoRoot > div.squadrons-info__content-wrapper > div.squadrons-info__title"
	);
	const squadname = element.textContent.trim().toString() + " ";
	return squadname;
}

async function getstatact(url) {
	//ließt aus der html objekt den Wert eines Elements aus. In dem Fall das Element was die Aktivität der Kampfgruppe anzeitg.
	const html = await geturldoc(url);
	const dom = new JSDOM(html); //hier wird das html objekt aus dem String vom Quelltext der Seite erstellt
	const element = dom.window.document.querySelector(
		"#bodyRoot > div.content > div:nth-child(2) > div:nth-child(3) > div > section > div.squadrons-profile__header-wrapper > div.squadrons-profile__header-aside.squadrons-counter.js-change-tabs > div.squadrons-counter__count-wrapper > div:nth-child(2) > div.squadrons-counter__value"
	); //hier wird das Element ausgelesen
	const iact = Number.parseInt(element.textContent.trim()); //hier wird der Text Content des Elements ausgelesen und mit trim alle Leerzeichen entfernt und danach in ein Intwert umgewandelt
	return iact;
}

async function getstatcount(url) {
	//ließt aus der html objekt den Wert eines Elements aus. In dem Fall das Element was die Anzahl der Mitglieder zeigt.
	try {
		const html = await geturldoc(url);
		const doc = new JSDOM(html); //hier wird das html objekt aus dem String vom Quelltext der Seite erstellt
		const count1 = doc.window.document.querySelector(
			"#squadronsInfoRoot > div.squadrons-info__content-wrapper > div:nth-child(2)"
		); //hier wird das Element ausgelesen
		let temporary = count1.textContent;
		temporary = temporary.replace(/[A-z]/g, ""); // ersetzen der Buchstaben durch nichts aka. Buchstaben entfernen
		temporary = temporary.replace(/ /g, ""); //Leerzeichen entfernen
		temporary = temporary.replace(/:/g, ""); //Doppelpunkt entfernen
		const icount1 = Number.parseInt(temporary); //den Rest des String in einen Intwert übersetzen
		return icount1;
	} catch (error) {
		console.error("Error:", error);
	}
}

async function geturldoc(url) {
	//holt sich den Quelltext der Webseite
	const response = await fetch(url);
	const html = await response.text();
	return html;
}