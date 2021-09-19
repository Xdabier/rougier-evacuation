import {ResultSet, SQLError} from 'react-native-sqlite-storage';
import SqlLiteService from './sql-lite.service';
import {LogDetailsInterface, LogInterface} from '../interfaces/log.interface';
import {EvacuationStatsInterface} from '../interfaces/evacuation-stats.interface';
import {
    getEvacuationStatsById,
    updateEvacuationStats
} from './evacuation-stats.service';
import {updateSyncEvacuationFile} from './evacuation.service';

const SQLiteService: SqlLiteService = new SqlLiteService();

export const getLogs = async (
    evacId: string,
    close = false
): Promise<LogDetailsInterface[]> => {
    try {
        const RES: ResultSet = await SQLiteService.executeQuery(
            `SELECT l.evacuationId, l.creationDate, l.barCode,
            l.logging, l.indicator, l.lengthVal, l.id, l.dgb, l.dpb, l.diameter, l.volume,
            l.quality, l.status, l.statusPattern, l.comment, g.code AS gasCode, g.name
            AS gasName FROM log AS l INNER JOIN gasoline AS g
            ON g.code = l.gasoline WHERE l.evacuationId = ?;`,
            [evacId]
        );
        if (close && !SQLiteService.finished) {
            SQLiteService.db.close().catch((reason: SQLError) => {
                console.error('err log = ', reason);
            });
        }
        return RES.rows.raw() as LogDetailsInterface[];
    } catch (e) {
        return Promise.reject(e);
    }
};

export const getRawLogs = async (
    evacId: string,
    close = false
): Promise<LogInterface[]> => {
    try {
        const RES: ResultSet = await SQLiteService.executeQuery(
            `SELECT l.barCode, l.logging, l.indicator,
            l.lengthVal, l.id, l.dgb, l.dpb, l.diameter, l.volume,
            l.quality, l.status, l.statusPattern, l.comment, l.gasoline FROM log AS l
            WHERE l.evacuationId = ?;`,
            [evacId]
        );
        if (close && !SQLiteService.finished) {
            SQLiteService.db.close().catch((reason: SQLError) => {
                console.error('err log = ', reason);
            });
        }
        return RES.rows.raw() as LogInterface[];
    } catch (e) {
        return Promise.reject(e);
    }
};

export const insertLog = async (element: LogInterface) => {
    try {
        const KEYS = Object.keys(element);
        await SQLiteService.executeQuery(
            `INSERT INTO log (${KEYS.join(', ')}) VALUES (${KEYS.map(
                () => '?'
            ).join(', ')})`,
            KEYS.map((x: string) => (element as any)[x])
        );
        const PARC_PREP_STATS: EvacuationStatsInterface[] = await getEvacuationStatsById(
            element.evacuationId
        );

        await updateSyncEvacuationFile(`${element.evacuationId}`, 0);

        const STATS: EvacuationStatsInterface = {
            ...PARC_PREP_STATS[0],
            logsNumber: PARC_PREP_STATS[0].logsNumber
                ? PARC_PREP_STATS[0].logsNumber + 1
                : 1,
            lastLogDate: element.creationDate,
            lastLogId: element.id
        };

        return updateEvacuationStats(STATS);
    } catch (e) {
        return Promise.reject(e);
    }
};

export const updateLog = async (oldId: string, element: LogInterface) => {
    try {
        const KEYS = Object.keys(element);
        const UP_L = await SQLiteService.executeQuery(
            `UPDATE log SET ${KEYS.map((value: string) => `${value} = ?`).join(
                ', '
            )} WHERE id = ?;`,
            [...KEYS.map((x: string) => (element as any)[x]), oldId]
        );
        await updateSyncEvacuationFile(`${element.evacuationId}`, 0);

        return UP_L;
    } catch (e) {
        return Promise.reject(e);
    }
};
