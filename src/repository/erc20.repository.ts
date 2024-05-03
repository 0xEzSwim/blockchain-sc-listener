import { ethers } from "ethers";
import erc20ABI from '../env/config/erc20.abi.json';
import { yam } from "../env/index.env";
import { TokenInfo } from "../shared/index.shared";
import { Utils } from "../shared/utils";

export class Erc20Repository {

    provider: ethers.providers.JsonRpcProvider;
    constructor() {
        this.provider = new ethers.providers.JsonRpcProvider(yam.rpc);
        
    }

    async getBalance(token: TokenInfo): Promise<number> {
        console.log("token info:", token);
        const contract: ethers.Contract = new ethers.Contract(token.contractAddress, erc20ABI, this.provider);
        const balance: ethers.BigNumberish = await contract.balanceOf("0x3c63F894b4Aefce537d1cfa79D77C86E996fE810");
        console.log("BEFORE - Balance:", balance);
        const balanceNumber: number = Utils.formatUnits(balance, token.decimals);
        console.log("AFTER - Balance:", balance);
        return balanceNumber;
    }

}