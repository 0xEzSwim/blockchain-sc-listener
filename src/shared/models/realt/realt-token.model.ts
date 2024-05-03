export interface RealtToken {
    fullName: string;
    shortName: string;
    symbol: string;
    tokenPrice: number;
    currency: string;
    uuid: string;
    ethereumContract: string;
    xDaiContract: string;
    gnosisContract: string;
    lastUpdate: {
        date: Date,
        timezone_type: 3,
        timezone: string
      }
    updateTimestamp: number;
}
