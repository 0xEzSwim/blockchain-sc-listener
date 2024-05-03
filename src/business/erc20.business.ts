import { Erc20Repository } from "../repository/index.repository";
import { TokenInfo } from "../shared/index.shared";

export class Erc20Business {
    erc20Repo: Erc20Repository;

    constructor() {
        this.erc20Repo = new Erc20Repository();
    }

    public getBalance(token: TokenInfo): Promise<number> {
        return this.erc20Repo.getBalance(token);
    }
}