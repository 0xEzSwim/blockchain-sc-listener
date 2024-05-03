import axios, { AxiosResponse } from "axios";
import { realtAPI } from "../env/index.env";
import { RealtToken, Utils } from "../shared/index.shared";


export class RealtRepository {

    realtTokens: RealtToken[] = [];

    constructor() {}

    public getAllRealtToken(): Promise<RealtToken[]> {
        return new Promise<RealtToken[]>((resolve, reject) => {
            if(!!this.realtTokens?.length) {
                resolve(this.realtTokens);
            }
            axios.get<RealtToken[]>(`${realtAPI}/v1/token/`)
            .then(
                (response: AxiosResponse<RealtToken[], any>) => {
                    const realtokens: RealtToken[] = response.data;
                    realtokens.map(realtToken => realtToken.updateTimestamp = Utils.toTimestamp(realtToken.lastUpdate.date));
                    this.realtTokens = realtokens;
                    resolve(this.realtTokens);
                }
            )
            .catch(
                (error) => {
                    console.log(error);
                    reject();
                }
            )
        })
    }

    static getRealtToken(contractAddress: string): Promise<RealtToken> {
        return new Promise<RealtToken>((resolve, reject) => {
            axios.get<RealtToken>(`${realtAPI}/v1/token/${contractAddress}`)
            .then(
                (response: AxiosResponse<RealtToken, any>) => {
                    resolve(response.data);
                }
            )
            .catch(
                (error) => {
                    console.log(error);
                    reject();
                }
            )
        })
    }
}
