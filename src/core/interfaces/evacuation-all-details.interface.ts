export interface EvacuationAllDetailsInterface {
    creationDate: string;
    allSynced: 0 | 1;
    departureParcName: string;
    departureParcCode: string;
    arrivalParcName: string;
    arrivalParcCode: string;
    driverName: string;
    driverCode: string;
    truckNumber: string;
    transporter: string;
    departureTime: string;
    arrivalTime: string;
    startParc: string;
    arrivalParc: string;
    pointer: string;
    receiver: string;
    lastLogDate: string | null;
    lastLogId: string | null;
    logsNumber: number;
    id: string;
    isDefault: 0 | 1;
}
