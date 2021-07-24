export interface EvacuationAllDetailsInterface {
    aac: string;
    creationDate: string;
    allSynced: 0 | 1;
    siteName: string;
    siteCode: string;
    cuberName: string;
    cuberCode: string;
    lastLogDate: string | null;
    lastLogId: string | null;
    logsNumber: number;
    id: string;
    isDefault: 0 | 1;
}
