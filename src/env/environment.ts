import { environment as environmentDev } from "./environment.dev";
import { environment as environmentProd } from "./environment.prod";

const setEnv = () => {
    let env: any;
    switch (process.env.CONFIG) {
        case "dev":
            env = environmentDev;
            break;
        case "prod":
            env = environmentProd;
            break;
        default:
            env = environmentDev;
            break;
    }
    return env;
}

export const ENVIRONMENT = setEnv();