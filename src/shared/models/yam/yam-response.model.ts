import { YamOffer } from "./yam-offer.model";

export enum StatusResponse {
    OK = 1, 
    UNKNOWN_ERROR = 2,
    ID_ERROR = 3,
}

export const statusResponseMessages: Record<StatusResponse, string> = {
    1: "Ok",
    2: "Unknown error",
    3: "Id is wrong"
}

export class YamResponse {
    status: StatusResponse;
    yamOffer?: YamOffer;

    constructor(status: StatusResponse, yamOffer?: YamOffer) {
        this.status = status;
        if(yamOffer) {
            this.yamOffer = yamOffer;
        }
    }

}