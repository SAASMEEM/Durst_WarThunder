const Discord = require("discord.js")
const { SlashCommandBuilder } = require("@discordjs/builders")
const botconfig = require('../../config.json')
const { checkPerms } = require("../../import_folders/functions.js")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("team")
        .setDescription("manage teams")
        .addSubcommand(subcommand =>
            subcommand
                .setName('generate')
                .setDescription('Generate random teams')
                .addIntegerOption(option =>
                    option
                        .setName('teamnum')
                        .setDescription('Choose how many teams you want to create')
                        .setRequired(true)
                        .setChoices(
                            { name: '2', value: 2 },
                            { name: '3', value: 3 },
                            { name: '4', value: 4 }
                        )
                )
        ),
    async execute(interaction) {
        // check for required permission
        const check = await checkPerms(
            interaction,
            null,
            botconfig.uffzRoleId,
            null
        );
        if (!check) return

        const teamnumber = interaction.options.getInteger("teamnum")

        // declare embed
		const tableEmbed = new Discord.MessageEmbed({
			color: "880099",
			title: `Team Generator (${teamnumber} teams)`,
			description: `\u200B`,
			fields: [
				{ name: "Entry:", value: "\u200B", inline: true },
			],
			timestamp: Date.now(),
		})

        for (let team = 1; team <= teamnumber; team++) {
            tableEmbed.addFields({ name: `Team ${team}`, value: `\u200B`})
        }

        const message = await interaction.channel.send({
			embeds: [tableEmbed],
			// components: [Reactions],
			// fetchReply: true,
		});
    },
};