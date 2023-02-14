import { REST, Routes, Client, Events, GatewayIntentBits, TextChannel } from 'discord.js';

import dotenv from "dotenv";
dotenv.config();


export class DiscordBridge {

    client: Client;

    constructor() {
        console.log("Discord bridge...");

        // Create a new client instance
        this.client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                // GatewayIntentBits.MessageContent,
                // GatewayIntentBits.GuildMembers,
            ],
        });

        // When the client is ready, run this code (only once)
        // We use 'c' for the event parameter to keep it separate from the already defined 'client'
        this.client.once(Events.ClientReady, async c => {
            console.log(`Ready! Logged in as ${c.user.tag}`);
        });

        // client.on(Events.MessageCreate, (message) => {
        //     console.log(message.author.tag + ' sent: ' + message.content);
        // });

        this.client.on(Events.InteractionCreate, async interaction => {
            // if (!interaction.isChatInputCommand()) return;

            console.log(JSON.stringify(interaction));

            // if (interaction.commandName === 'ping') {
            //     await interaction.reply({ content: 'Secret Pong!', ephemeral: true });
            // }
        });

        // Log in to Discord with your client's token
        this.client.login(process.env.DISCORD_TOKEN);

        //

        const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

        // and deploy your commands!
        (async () => {
            try {

                // The put method is used to fully refresh all commands in the guild with the current set
                const data = await rest.put(
                    Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID, process.env.DISCORD_GUILD_ID),
                    { body: {} },
                );

                console.log(data);

                // console.log(`Successfully reloaded ${data.length} application (/) commands.`);
            } catch (error) {
                // And of course, make sure you catch and log any errors!
                console.error(error);
            }
        })();
    }

    async say(message: string) {
        const channel: TextChannel = await this.client.channels.fetch("349550928569040896") as TextChannel;
        await channel.send(message);
    }

}