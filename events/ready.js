import shellTitle from "node-bash-title";
import { statupdate } from "./stats.js"

export const name = "ready";
export function execute(client) {
	shellTitle("Durst-WarThunder");
	console.clear();
	console.log(`Ready! Logged in as`, client.user.tag, `\n`, new Date());

	//set BotStatus every 24h to prevent it from loosing it
	setInterval(() => {
		client.user.setPresence({
			activities: [
				{
					name: "War Thunder",
					type: "PLAYING",
				},
			],
			status: "idle",
		});
	}, 1000 * 60);
  statupdate(client);
}
