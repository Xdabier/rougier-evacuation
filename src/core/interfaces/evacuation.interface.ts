export interface EvacuationInterface {
    transporter?: string;
    creationDate: string;
    truckNumber: string;
    driver: string;
    departureTime?: string;
    arrivalTime?: string;
    departureParc?: string;
    arrivalParc?: string;
    pointer?: string;
    receiver?: string;
    allSynced?: 0 | 1;
    defaultEvacFile?: 0 | 1;
    id: string;
}
