import {SyncDataInterface} from '../interfaces/sync-data.interface';
import {EvacuationInterface} from '../interfaces/evacuation.interface';
import {getRawEvacuationFileById} from './evacuation.service';
import {LogInterface} from '../interfaces/log.interface';
import {getRawLogs} from './logs.service';
import {
    OdooEvacuationBodyInterface,
    OdooLogsBodyInterface,
    OdooSyncBodyInterface
} from '../interfaces/odoo-sync-body.interface';

export const generateSingleSyncFile = async (
    evacuationId: string
): Promise<SyncDataInterface> => {
    try {
        const EVAC: EvacuationInterface[] = await getRawEvacuationFileById(
            evacuationId
        );

        if (EVAC.length && EVAC[0].id) {
            const LOGS: LogInterface[] = await getRawLogs(EVAC[0]?.id);
            return {
                ...EVAC[0],
                logs: LOGS
            };
        }
        throw new Error('Evacuation file not found');
    } catch (e) {
        throw new Error(e);
    }
};

export const convertLogsToSyncLogs = (
    logs: LogInterface[]
): OdooLogsBodyInterface[] =>
    logs.map((log: LogInterface) => {
        const ODOO_LOG_BODY: OdooLogsBodyInterface = {
            num_bille: log.id,
            dgb: log.dgb,
            dpb: log.dpb,
            barcode: log.barCode,
            diameter_moyen: log.diameter,
            essence: log.gasoline,
            num_indice: log.indicator,
            num_abattage: log.logging,
            longueur: log.lengthVal,
            quality: log.quality,
            volume: log.volume
        };

        if (log.status) {
            ODOO_LOG_BODY.statut = log.status;
        }

        if (log.statusPattern) {
            ODOO_LOG_BODY.motif_statut = log.statusPattern;
        }

        if (log.comment) {
            ODOO_LOG_BODY.commentaire = log.comment;
        }

        return ODOO_LOG_BODY;
    });

const parseTime = (time: number): string => {
    if (`${time}`.length === 1) {
        return `0${time}`;
    }
    return `${time}`;
};

const convertDate = (date: Date): string =>
    `${parseTime(date.getMonth() + 1)}/${parseTime(
        date.getDate()
    )}/${date.getFullYear()}`;

export const convertToTimeOnly = (date: Date): string =>
    `${parseTime(date.getHours())}:${parseTime(date.getMinutes())}`;

export const convertSyncFile = (
    syncFile: SyncDataInterface
): OdooSyncBodyInterface => {
    const ODOO_EVAC: OdooEvacuationBodyInterface = {
        num_fiche: syncFile.id,
        date: convertDate(new Date(syncFile.creationDate)),
        chauffeur: syncFile.driver,
        num_camion: syncFile.truckNumber
    };

    if (syncFile.transporter) {
        ODOO_EVAC.transporteur = syncFile.transporter;
    }

    if (syncFile.departureParc) {
        ODOO_EVAC.parc_depart = syncFile.departureParc;
    }

    if (syncFile.arrivalParc) {
        ODOO_EVAC.parc_arrivee = syncFile.arrivalParc;
    }

    if (syncFile.departureTime) {
        ODOO_EVAC.heure_depart = syncFile.departureTime;
    }

    if (syncFile.arrivalTime) {
        ODOO_EVAC.heure_arrivee = syncFile.arrivalTime;
    }

    if (syncFile.pointer) {
        ODOO_EVAC.pointeur = syncFile.pointer;
    }

    if (syncFile.receiver) {
        ODOO_EVAC.receptionnaire = syncFile.receiver;
    }

    console.log(
        JSON.stringify({
            ...ODOO_EVAC,
            sync_date: convertDate(new Date()),
            sync: true,
            billes: convertLogsToSyncLogs(syncFile.logs)
        })
    );
    return {
        ...ODOO_EVAC,
        sync_date: convertDate(new Date()),
        sync: true,
        billes: convertLogsToSyncLogs(syncFile.logs)
    };
};
