import { ethers } from "ethers";
import { Utils } from "../../utils";
import { OfferType } from "../order-type.model";
import { TokenInfo } from "../token-info.model";

export class YamOffer {
    id!: number;
    type: OfferType;
    bidToken!: TokenInfo;
    askToken!: TokenInfo;
    unitPrice!: number;
    quantity!: number;
    isPrivate!: boolean;
    priceDifference?: number;

    private constructor(init: Partial<YamOffer>) {
        Object.assign(this, init);
        let orderType: OfferType = OfferType.SWAP_ORFFER;
        if(!init?.bidToken?.isRealtToken && init?.askToken?.isRealtToken) {
            orderType = OfferType.BUY_OFFER;
            this.quantity = (init?.quantity!/init?.unitPrice!);
            this.unitPrice = (1/init?.unitPrice!);
        } else if(init?.bidToken?.isRealtToken && !init?.askToken?.isRealtToken) {
            orderType = OfferType.SELL_OFFER;
        }
        this.type = orderType;
    }

    static async initialize(offerId: ethers.BigNumberish, buyer: string, offerToken: string, buyerToken: string, price: ethers.BigNumberish, amount: ethers.BigNumberish) {
        const id: number = Utils.formatUnits(offerId, 0);
        const isPrivate: boolean = Utils.hexToDecimal(buyer) != 0;
        const bidToken: TokenInfo = await TokenInfo.fetchTokenInfo(offerToken.toLowerCase());
        const askToken: TokenInfo = await TokenInfo.fetchTokenInfo(buyerToken.toLowerCase());
        const unitPrice: number = Utils.formatUnits(price, askToken.decimals);
        const quantity: number = Utils.formatUnits(amount, bidToken.decimals);

        return new YamOffer({
            id: id,
            bidToken: bidToken,
            askToken: askToken,
            unitPrice: unitPrice,
            quantity: quantity,
            isPrivate: isPrivate
        });
    }
};