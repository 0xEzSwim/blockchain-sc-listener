import { Subject } from "rxjs";
import { YamRepository } from "../repository/index.repository";
import { OfferType, RealtToken, StatusResponse, TokenInfo, YamOffer, YamResponse } from "../shared/index.shared";
import { Erc20Business } from "./erc20.business";
import { RealtBusiness } from "./realt.business";


export class YamBusiness {
    yamRepo: YamRepository;
    realtBu: RealtBusiness;
    erc20Bu: Erc20Business;

    constructor() {
        this.yamRepo = new YamRepository();
        this.realtBu = new RealtBusiness();
        this.erc20Bu = new Erc20Business();
    }

    //#region ACTIONS
    public isValidOffer(yamOffer: YamOffer): boolean {
        if(yamOffer.priceDifference == undefined) {
            return false;
        }

        let isValid: boolean = !yamOffer.isPrivate && yamOffer.quantity > 0;
        if(yamOffer.type == OfferType.BUY_OFFER){
            isValid = isValid && (yamOffer.priceDifference! >= 0)
        } else {
            isValid = isValid && (yamOffer.priceDifference! <= 0)
        }
        return isValid;
    }

    private async buy(yamOffer: YamOffer): Promise<boolean> {
        let isDeal: boolean = false;
        if(yamOffer.type == OfferType.BUY_OFFER) {
            return isDeal;
        }

        const balance: number = await this.erc20Bu.getBalance(yamOffer.askToken);
        if(yamOffer.priceDifference! < 0){
            isDeal = true;
        }

        return isDeal;
    }

    private async sell(yamOffer: YamOffer): Promise<boolean> {
        let isDeal: boolean = false;
        if(yamOffer.type == OfferType.SELL_OFFER) {
            return isDeal;
        }
        
        const balance: number = await this.erc20Bu.getBalance(yamOffer.askToken);
        if(yamOffer.priceDifference! > 0){
            isDeal = true;
        }

        return isDeal;
    }

    public async makeDeal(yamOffer: YamOffer): Promise<boolean> {
        let isDeal: boolean = this.isValidOffer(yamOffer);
        if(yamOffer.type == OfferType.BUY_OFFER) {
            const shouldSell: boolean = await this.sell(yamOffer);
            isDeal = isDeal && shouldSell;
        } else {
            const shouldBuy: boolean = await this.buy(yamOffer);
            isDeal = isDeal && shouldBuy;
        }

        return isDeal;
    }
    //#endregion

    //#region Offer
    public createOfferListener(offerSubject: Subject<YamResponse>): void {
        this.yamRepo.createOfferListener(offerSubject);
    }

    private async getRealtTokenPrice(token: TokenInfo): Promise<number | undefined> {
        if(!token.isRealtToken){
            return;
        }

        const realtTokens = await this.realtBu.getAllRealtToken();
        const rt: RealtToken | undefined = realtTokens.find(realtToken => realtToken.uuid.toLowerCase() == token.contractAddress!);
        return rt?.tokenPrice;
    }

    public async setOfferPriceDifference(offer: YamOffer): Promise<YamOffer> {
        const ipoBidTokenPrice: number | undefined = await this.getRealtTokenPrice(offer.bidToken);
        const ipoAskTokenPrice: number | undefined = await this.getRealtTokenPrice(offer.askToken);
        if(ipoBidTokenPrice && !ipoAskTokenPrice){
            offer.priceDifference = (offer.unitPrice - ipoBidTokenPrice)/ipoBidTokenPrice;
        } else if(!ipoBidTokenPrice && ipoAskTokenPrice) {
            offer.priceDifference = ((offer.unitPrice) - ipoAskTokenPrice)/ipoAskTokenPrice;
        }
        
        return offer;
    }

    public async getOfferCount(): Promise<number> {
        return await this.yamRepo.getOfferCount();
    }

    public async getOfferById(offerId: number): Promise<YamResponse> {
        const count: number = await this.getOfferCount();
        if(offerId > count - 1) {
            return new YamResponse(StatusResponse.ID_ERROR);
        }
        const offerResponse: YamResponse = await this.yamRepo.getOfferByIdFromBlockChain(offerId);
        if(offerResponse.status != StatusResponse.OK) {
            return offerResponse;
        }
        offerResponse.yamOffer = await this.setOfferPriceDifference(offerResponse.yamOffer!);

        return offerResponse;
    }

    public getAllOffers(): Promise<YamResponse[]> {
        return this.yamRepo.getAllOffers();
    }

    //#endregion
}