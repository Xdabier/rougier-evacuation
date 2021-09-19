import {ResultSet, SQLError} from 'react-native-sqlite-storage';
import SqlLiteService from './sql-lite.service';
import {EvacuationInterface} from '../interfaces/evacuation.interface';
import {upsertDefaultEvacId} from './def-evac.service';
import {EvacuationStatsInterface} from '../interfaces/evacuation-stats.interface';
import {
    insertEvacuationStats,
    updateEvacuationStats
} from './evacuation-stats.service';
import {EvacuationAllDetailsInterface} from '../interfaces/evacuation-all-details.interface';

const SQLiteService: SqlLiteService = new SqlLiteService();

export function randomInt(min = 100, max = 99999): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

export const getEvacuationFilesIds = async (
    close = false
): Promise<string[]> => {
    try {
        const RES: ResultSet = await SQLiteService.executeQuery(
            `SELECT evac.id FROM evacuation AS evac;`
        );
        if (close && !SQLiteService.finished) {
            SQLiteService.db.close().catch((reason: SQLError) => {
                console.error('err evac = ', reason);
            });
        }
        return RES.rows.raw().map((v: {id: number}) => `${v.id}`) as string[];
    } catch (e) {
        return Promise.reject(e);
    }
};

export const updateEvacuation = async (
    element: EvacuationInterface,
    noSync = true
): Promise<ResultSet> => {
    try {
        const UN_SYNCED: EvacuationInterface = element;

        if (noSync) {
            UN_SYNCED.allSynced = 0;
        }

        const {id, defaultEvacFile, ...others} = UN_SYNCED;
        const KEYS = Object.keys(others);
        const UPD = await SQLiteService.executeQuery(
            `UPDATE evacuation SET ${KEYS.map(
                (value: string) => `${value} = ?`
            ).join(', ')} WHERE id = ?;`,
            [...KEYS.map((x: string) => (others as any)[x]), id]
        );

        if (defaultEvacFile && id) {
            await updateEvacuationStats({
                evacuationId: id,
                isDefault: 1
            });
            return upsertDefaultEvacId({evacId: id, id: 0});
        }
        return UPD;
    } catch (e) {
        return Promise.reject(e);
    }
};

export const updateSyncEvacuationFile = async (
    id: string,
    syncStatus: 1 | 0
): Promise<ResultSet> => {
    try {
        const SYNC_STATUS: EvacuationInterface = {
            id: `${id}`,
            allSynced: syncStatus
        } as EvacuationInterface;

        return await updateEvacuation(SYNC_STATUS, false);
    } catch (e) {
        return Promise.reject(e);
    }
};

export const getRawEvacuationFileById = async (
    id: string,
    close = false
): Promise<EvacuationInterface[]> => {
    try {
        const RES: ResultSet = await SQLiteService.executeQuery(
            `SELECT evac.id, evac.creationDate, evac.cuber,
            evac.truckNumber, evac.driver, evac.departureTime, evac.arrivalTime,
            evac.startParc, evac.arrivalParc, evac.pointer, evac.receiver,
            evac.site FROM evacuation AS evac WHERE evac.id = ?;`,
            [id]
        );
        if (close && !SQLiteService.finished) {
            SQLiteService.db.close().catch((reason: SQLError) => {
                console.error('err evac = ', reason);
            });
        }
        return RES.rows.raw() as EvacuationInterface[];
    } catch (e) {
        return Promise.reject(e);
    }
};

export const getEvacuationFileById = async (
    id: string,
    close = false
): Promise<EvacuationAllDetailsInterface[]> => {
    try {
        const RES: ResultSet = await SQLiteService.executeQuery(
            `SELECT evac.id, evac.aac, evac.creationDate, evac.allSynced,
            evac.truckNumber, evac.driver, evac.departureTime, evac.arrivalTime,
            evac.startParc, evac.arrivalParc, evac.pointer, evac.receiver,
            si.name AS siteName, si.code AS siteCode, cu.name AS cuberName,
            cu.code AS cuberCode, evacStats.lastLogDate, evacStats.lastLogId, evacStats.logsNumber,
            evacStats.isDefault FROM evacuation AS evac INNER JOIN cuber AS
            cu ON cu.code = evac.cuber JOIN site AS si ON si.code = evac.site
            INNER JOIN evacuationStats AS evacStats ON evacStats.evacuationId = evac.id WHERE evac.id = ?;`,
            [id]
        );
        if (close && !SQLiteService.finished) {
            SQLiteService.db.close().catch((reason: SQLError) => {
                console.error('err evac = ', reason);
            });
        }
        return RES.rows.raw() as EvacuationAllDetailsInterface[];
    } catch (e) {
        return Promise.reject(e);
    }
};

export const getEvacuationFiles = async (
    close = false
): Promise<EvacuationAllDetailsInterface[]> => {
    try {
        const RES: ResultSet = await SQLiteService.executeQuery(
            `SELECT evac.id, evac.creationDate, evac.allSynced,
            evac.truckNumber, evac.driver, evac.departureTime, evac.arrivalTime,
            evac.startParc, evac.arrivalParc, evac.pointer, evac.receiver,
            si.name AS siteName, si.code AS siteCode, cu.name AS cuberName,
            cu.code AS cuberCode, evacStats.lastLogDate, evacStats.lastLogId, evacStats.logsNumber,
            evacStats.isDefault FROM evacuation AS evac INNER JOIN cuber AS
            cu ON cu.code = evac.cuber INNER JOIN site AS si ON si.code = evac.site
            INNER JOIN evacuationStats AS evacStats ON evacStats.evacuationId = evac.id;`
        );
        if (close && !SQLiteService.finished) {
            SQLiteService.db.close().catch((reason: SQLError) => {
                console.error('err evac = ', reason);
            });
        }
        return RES.rows.raw() as EvacuationAllDetailsInterface[];
    } catch (e) {
        return Promise.reject(e);
    }
};

export const insertEvacuationFile = async (
    element: EvacuationInterface
): Promise<ResultSet> => {
    try {
        const {defaultEvacFile, ...others} = element;
        const KEYS = Object.keys(others);
        const STR: string = `INSERT INTO evac (${KEYS.join(
            ', '
        )}) VALUES (${KEYS.map(() => '?').join(', ')});`;
        await SQLiteService.executeQuery(
            STR,
            KEYS.map((x: string) => (others as any)[x])
        );
        // const ROW_ID: ResultSet = await SQLiteService.executeQuery(
        //     'SELECT last_insert_rowid();'
        // );
        // const ID: number = ROW_ID.rows.item(0)['last_insert_rowid()'];
        const STATS: EvacuationStatsInterface = {
            isDefault: defaultEvacFile !== undefined ? defaultEvacFile : 0,
            logsNumber: 0,
            evacuationId: others.id
        };

        const INIT_STATS = await insertEvacuationStats(STATS);

        if (element.defaultEvacFile) {
            return upsertDefaultEvacId({evacId: others.id, id: 0});
        }
        return INIT_STATS;
    } catch (e) {
        console.log('err = ', e);
        return Promise.reject(e);
    }
};
