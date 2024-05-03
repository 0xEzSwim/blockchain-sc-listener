import { ContractInterface, ethers } from "ethers";
import { ENVIRONMENT } from "../../environment";
import yamABI from './yam.abi.json';

class YamConfig {
    rpc: string;
    abi: ContractInterface;
    contractAddress: string;

    constructor(rpc: string, abi: ContractInterface, contractAddress: string) {
        this.rpc = rpc;
        this.abi = abi;
        this.contractAddress = contractAddress;
    }
}

export const yam = new YamConfig(ENVIRONMENT.RCP, yamABI, ENVIRONMENT.YAM_CONTRACT_ADDRESS);
export const provider: ethers.providers.JsonRpcProvider = new ethers.providers.JsonRpcProvider(yam.rpc);
export const contract: ethers.Contract = new ethers.Contract(yam.contractAddress, yam.abi, provider);