import { Subject } from "rxjs";
import { 
    StatusResponse,
    Utils, 
    YamOffer, 
    YamResponse } from "../shared/index.shared";
import { contract } from "../env/index.env";
import { ethers } from "ethers";

export class YamRepository {

    yamOffers: YamResponse[] = [];

    constructor() {}

    public async getOfferCount(): Promise<number> {
        const count: {_hex: string, _isBigNumber: boolean} = await contract.getOfferCount();
        return Utils.hexToDecimal(count._hex);
    }

    public getOfferById(offerId: number): Promise<YamResponse> {
        return new Promise<YamResponse>((resolve) => {
            resolve(this.yamOffers[offerId]);
        });
    }
    
    public async getOfferByIdFromBlockChain(offerId: number): Promise<YamResponse> {
        try {
            const [offerToken, buyerToken, seller, buyer, price, amount] = await contract.showOffer(offerId);
            console.log("getOfferByIdFromBlockChain - Offer: ", await contract.showOffer(offerId));
            const offerDetails = await YamOffer.initialize(offerId, buyer, offerToken, buyerToken, price, amount);
            return new YamResponse(StatusResponse.OK, offerDetails);
        } catch(error: any) {
            console.error(`Get offer ${offerId} - Error: `, error.reason);
            return new YamResponse(StatusResponse.UNKNOWN_ERROR);
        }
    }

    public getAllOffers(): Promise<YamResponse[]> {
        return new Promise<YamResponse[]>(async (resolve) => {
            const count: number = await this.getOfferCount();
            if(this.yamOffers?.length == count) {
                resolve(this.yamOffers);
            }
            for (let index = 0; index < count; index++) {
                const response = await this.getOfferByIdFromBlockChain(index);
                this.yamOffers.push(response);
            }
            console.log("offers: ", this.yamOffers);
            resolve(this.yamOffers);
        });
    }

    public createOfferListener(offerSubject: Subject<YamResponse>): void {
        contract.on("OfferCreated",
            async (
                offerToken: string,
                buyerToken: string,
                seller: string,
                buyer: string,
                offerId: ethers.BigNumberish,
                price: ethers.BigNumberish,
                amount: ethers.BigNumberish,
                event: any
            ) => {
                const newOffer = await YamOffer.initialize(offerId, buyer, offerToken, buyerToken, price, amount);
                const response = new YamResponse(StatusResponse.OK, newOffer);
                this.yamOffers.push(response);
                offerSubject.next(response);
            }
        );
    }

}