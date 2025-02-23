import { CommandLoader, CommandPoster } from '@statsify/discord';
import { config } from 'dotenv';
import path from 'path';
import 'reflect-metadata';
import { InteractionServer, RestClient, WebsocketShard } from 'tiny-discord';
import { CommandListener } from './command.listener';
import { loadFont } from './services/font.service';

config({ path: '../../.env' });

async function bootstrap() {
  await loadFont();
  const rest = new RestClient({ token: process.env.DISCORD_BOT_TOKEN });
  const commands = await CommandLoader.load(path.join(__dirname, './commands'));

  const poster = new CommandPoster(rest);

  await poster.post(
    commands,
    process.env.DISCORD_BOT_APPLICATION_ID,
    process.env.DISCORD_BOT_GUILD
  );

  const port = process.env.DISCORD_BOT_PORT;

  const listener = CommandListener.create(
    port
      ? new InteractionServer({ key: process.env.DISCORD_BOT_PUBLIC_KEY })
      : new WebsocketShard({ token: process.env.DISCORD_BOT_TOKEN, intents: 1 }),
    rest,
    commands
  );

  await listener.listen();
}

bootstrap();
