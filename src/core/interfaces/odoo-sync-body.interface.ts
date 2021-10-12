export interface OdooEvacuationBodyInterface {
    num_fiche: string;
    chauffeur: string;
    num_camion: string;
    transporteur?: string;
    date: string;
    heure_depart?: string;
    heure_arrivee?: string;
    parc_depart?: string;
    parc_arrivee?: string;
    pointeur?: string;
    receptionnaire?: string;
}

export interface OdooLogsBodyInterface {
    barcode: string;
    num_abattage: string;
    num_indice: string;
    num_bille: string;
    diameter_moyen: number;
    dgb: number;
    dpb: number;
    longueur: number;
    volume: number;
    quality: string;
    statut?: string;
    motif_statut?: string;
    essence: string;
    commentaire?: string;
}

export interface OdooSyncBodyInterface extends OdooEvacuationBodyInterface {
    sync: boolean;
    sync_date: string;
    billes: OdooLogsBodyInterface[];
}
