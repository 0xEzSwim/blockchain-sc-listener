import { RealtRepository } from "../repository/index.repository";
import { RealtToken } from "../shared/index.shared";

export class RealtBusiness {
    realtRepo: RealtRepository;

    constructor() {
        this.realtRepo = new RealtRepository();
    }

    public getAllRealtToken(): Promise<RealtToken[]> {
        return this.realtRepo.getAllRealtToken();
    }
}
