
import { Context, Telegraf } from 'telegraf';
import { ENVIRONMENT } from "../env/environment";
import { debounceTime, Subject } from "rxjs";
import moment from 'moment';
import { YamBusiness } from '../business/index.business';
import { 
    OfferType, 
    offerTypes, 
    Queue, 
    StatusResponse, 
    statusResponseMessages, 
    Utils, 
    YamOffer, 
    YamResponse } from '../shared/index.shared';

export class YamTelegramController {

    yamBu: YamBusiness;
    bot: Telegraf<Context>;
    chatId: number = 0;
    offerSubject$: Subject<YamResponse>;
    messagesSubject$: Subject<Queue<string>>;
    messages: Queue<string>;
    alertMessageConfig = {
        parse_mode: "HTML",
        disable_web_page_preview: true
    };

    constructor() {
        this.yamBu = new YamBusiness();
        this.bot = new Telegraf<Context>(ENVIRONMENT.TELEGRAM_TOKEN, {handlerTimeout: 9_000_000});
        this.offerSubject$ = new Subject<YamResponse>();
        this.messagesSubject$ = new Subject<Queue<string>>();
        this.messages = new Queue(this.messagesSubject$);
        
        this.bot.start(async (ctx) => {
            this.chatId = ctx.chat.id;
            ctx.reply(`⏳ Getting all  data...`);
            console.log(`\n⏳ Getting all  data...`);
            await this.yamBu.realtBu.getAllRealtToken(); // get all data from realt API before listening to blockchain
            //await this.yamBu.getAllOffers(); // get all yam offers from blockchain
            this.yamBu.createOfferListener(this.offerSubject$);
            ctx.reply(`⌛ Done`);
            console.log(`\n⌛ Done`);
            ctx.reply(`👀 YAM trading bot started at ${moment(new Date()).format("DD-MM-YYYY")}`);
            console.log(`\nListening to YAM started at ${moment(new Date()).format("DD-MM-YYYY")}`);
        });

        this.startAlertes();
        this.startComands();
        this.bot.launch();
        // Enable graceful stop
        process.once('SIGINT', () => this.bot.stop('SIGINT'));
        process.once('SIGTERM', () => this.bot.stop('SIGTERM'));
    }

    //#region MESSAGE
    private offerHeader = (marketName: string, offer: YamOffer): string => {
        let str: string = `<b><i>~${marketName.toUpperCase()}~</i></b>`
        + `\n\n${this.yamBu.isValidOffer(offer) ? '🟢' : '🔴'} `
        + `<a href="${ENVIRONMENT.YAM_WEBSITE}">${offerTypes[offer.type].toUpperCase()} offer ${offer.id}</a> `
        + (
            offer.isPrivate
            ? `🔒`
            : ""
        );
        return str;
    }

    private offerBody = (offer: YamOffer): string => {
        let str: string = "\n<pre>";
        if(offer.type == OfferType.BUY_OFFER) {
            str += `${offer.askToken.name}/${offer.bidToken.name}`;
        } else {
            str += `${offer.bidToken.name}/${offer.askToken.name}`;
        }

        str += `\nPrice: ${Utils.round(offer.unitPrice, 2)} `
        + (
            offer.priceDifference || offer.priceDifference == 0 
            ? `(${ (offer.priceDifference >= 0 ? "+" : "") + Utils.round(offer.priceDifference, 2) * 100}%)`
            : ''
        )
        + `\nQuantity: ${offer.quantity}</pre>`;
    
        return str;
    }

    private offerFooter = (offer: YamOffer): string => {
        let str: string = `\n`
        + (
            offer.bidToken.isRealtToken 
            ? `\n<a href="${offer.bidToken.getRealtLink()}">ℹ ${offer.bidToken.name}</a>` 
            : ""
        )
        + (
            offer.askToken.isRealtToken 
            ? `\n<a href="${offer.askToken.getRealtLink()}">ℹ️ ${offer.askToken.name}</a>` 
            : ""
        );
        return str;
    }

    private offerMessage = (marketName: string, offer: YamOffer): string => {
        let str: string = this.offerHeader(marketName, offer) 
        + this.offerBody(offer)
        + this.offerFooter(offer);

        return str;
    }

    private reactionToOfferMessage = async (marketName: string, offer: YamOffer): Promise<string> => {
        const isValid: boolean = await this.yamBu.makeDeal(offer);
        let message: string = `<b><i>${marketName.toUpperCase()}</i></b> `;
        if(!isValid) {
            return message + `Offer ${offer.id} no deal 🙅‍♂️`;
        }

        if(offer.type == OfferType.BUY_OFFER) {
            message += `Offer ${offer.id} was sold 🤝`
        } else {
            message += `Offer ${offer.id} was bought 🤝`;
        }
        
        return message;
    }

    private sendTelegram(message: string): void {
        this.messages.enqueue(message);
    };
    //#endregion

    //#region ENDPOINTS
    private startAlertes(): void {
        this.messagesSubject$.pipe(debounceTime(500)).subscribe({
            next: (messages: Queue<string>) => {
                const message = messages.dequeue();
                if(!message) {
                    return;
                }
                console.log(`Bot sent: `, message);
                let isNotifOff: boolean = true;
                if(message.indexOf("🤝") != -1) {
                    isNotifOff = false;
                }
                const config: object = this.alertMessageConfig;
                Object.assign(config, {disable_notification: isNotifOff});
                this.bot.telegram.sendMessage(
                    this.chatId, 
                    message, 
                    config
                );
            }
        });

        this.offerSubject$.subscribe({
            next: async (response: YamResponse) => {
                if(response.status != StatusResponse.OK) {
                    const message: string = `Offer ${await this.yamBu.getOfferCount()}`
                    +`\n❌ ${statusResponseMessages[response.status]}`;
                    this.sendTelegram(message);
                    return;
                }
                const offer = await this.yamBu.setOfferPriceDifference(response.yamOffer!);
                this.sendTelegram(this.offerMessage("Yam", offer));
                this.sendTelegram(await this.reactionToOfferMessage("Yam", offer));
            }
        });
    }

    private startComands(): void {
        this.bot.command("getOffer", async (ctx) => {
            let input: string[] = ctx.message.text.split(" ");

            if(input.length == 1) {
                const message: string = "🆘 Missing <i>id</i> (number). see exemple:" 
                + `\n<pre>/getOffer 1 2 3</pre>`;
                this.sendTelegram(message);
                return;
            }

            const idArray: string[] = input.slice(1);
            for (let index = 0; index < idArray.length; index++) {
                const id: number = +idArray[index];
                if(Number.isNaN(id)) {
                    const message: string = `Offer ${idArray[index]}`
                    +`\n❌ <i>${idArray[index]}</i> is not a number. see exemple:`
                    + `\n<pre>/getOffer 1 2 3</pre>`;
                    this.sendTelegram(message);
                    continue;
                }

                const response: YamResponse = await this.yamBu.getOfferById(id);
                if(response.status != StatusResponse.OK) {
                    const message: string = `Offer ${id}`
                    +`\n❌ ${statusResponseMessages[response.status]}`;
                    this.sendTelegram(message);
                    continue;
                }

                const message: string = this.offerMessage("Yam", response.yamOffer!);
                this.sendTelegram(message);
                this.sendTelegram(await this.reactionToOfferMessage("Yam", response.yamOffer!));
            }
        });
    }
    //#endregion

}