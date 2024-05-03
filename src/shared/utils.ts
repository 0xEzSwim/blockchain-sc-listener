import { ethers } from "ethers";

export class Utils {
    
    static hexToDecimal(hex: string): number {
        return parseInt(hex, 16);
    }
    
    static formatUnits(num: ethers.BigNumberish, decimals: number): number {
        return +ethers.utils.formatUnits(num, decimals)
    }

    static round(num: number, decimals: number): number {
        return Number(Math.round(Number(num + "e" + decimals)) + "e-" + decimals);
    }

    static toTimestamp(utcDate: Date): number {
        var datum = new Date(utcDate);
        return datum.getTime()/1000;
       }
}
