import { YamTelegramController } from "./controller/index.controller";
import { ENVIRONMENT } from "./env/index.env";


const main = () => {
    console.log(`~~ ${ENVIRONMENT.ENV_TYPE} ~~`);
    const yamTelegramController: YamTelegramController = new YamTelegramController();
}

main();

/**
 * Telegram bot:
 *  1. YAM Bot
 *      [X] listening to offer CREATION
 *      [X] Get offers by ID
 *      [X] Reply to offer
 *      [X] Business logic for making deals (can be better, today it's pretty dumb)
 *      [] Close deals
 *      [] listening to offer UPDATE
 *      [] Deploy on Gnosis
 */