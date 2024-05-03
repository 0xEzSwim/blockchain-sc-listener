import { contract } from "../../env/config/yam/yam.config";
import { Utils } from "../utils";

const isRealtToken = (tokenSymbol: string): boolean => {
    return !!(tokenSymbol.indexOf("REALTOKEN") != -1);
}

export class TokenInfo {
    contractAddress!: string;
    decimals!: number;
    symbol!: string;
    name!: string;
    fullname!: string;
    isRealtToken!: boolean;

    private constructor(init: Partial<TokenInfo>) {
        Object.assign(this, init);
    }

    static async fetchTokenInfo(contractAddress: string) {
        const [decimals, symbol, name] = await contract.tokenInfo(contractAddress);
        const isRealt: boolean = isRealtToken(symbol);
        let shortName: string = "";
        if(!isRealt) {
            shortName = symbol;
        }
        else {
            const subStrings = name.toLowerCase().split(' ');
            shortName = `${subStrings[2]} ${subStrings[3]}${subStrings[3]?.length > 1 ? "" : " " + subStrings[4]}`;
        }

        return new TokenInfo({
            contractAddress: contractAddress,
            decimals: Utils.hexToDecimal(decimals._hex),
            symbol: symbol,
            name: shortName,
            fullname: name,
            isRealtToken: isRealt
        });
    }

    getRealtLink(): string | undefined {
        if (!this.isRealtToken) {
            return;
        }
        const subStrings = this.fullname.split(' ');
        const uri = subStrings.slice(2).join('-');
        return `https://realt.co/product/${uri.toLowerCase()}`;
    }
}