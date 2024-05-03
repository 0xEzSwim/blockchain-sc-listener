export enum OfferType {
    BUY_OFFER = 1,
    SELL_OFFER = 2,
    SWAP_ORFFER = 3
};

export const offerTypes: Record<OfferType, string> = {
    1: "purchase",
    2: "sale",
    3: "swap"
}