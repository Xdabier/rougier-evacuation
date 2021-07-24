import {ResultSet, SQLError} from 'react-native-sqlite-storage';
import SqlLiteService from './sql-lite.service';
import {EvacuationStatsInterface} from '../interfaces/evacuation-stats.interface';

const SQLiteService: SqlLiteService = new SqlLiteService();

export const getEvacuationStatsById = async (
    id: string,
    close = false
): Promise<EvacuationStatsInterface[]> => {
    try {
        const RES: ResultSet = await SQLiteService.executeQuery(
            `SELECT * FROM evacuationStats WHERE evacuationId = ?;`,
            [id]
        );
        if (close && !SQLiteService.finished) {
            SQLiteService.db.close().catch((reason: SQLError) => {
                console.error('err evacuationStats = ', reason);
            });
        }
        return RES.rows.raw() as EvacuationStatsInterface[];
    } catch (e) {
        return Promise.reject(e);
    }
};

export const insertEvacuationStats = async (
    element: EvacuationStatsInterface
): Promise<ResultSet> => {
    try {
        const KEYS = Object.keys(element);
        if (element.isDefault) {
            await SQLiteService.executeQuery(
                `UPDATE evacuationStats SET isDefault = 0 WHERE isDefault = 1;`
            );
        }
        return await SQLiteService.executeQuery(
            `INSERT INTO evacuationStats (${KEYS.join(', ')}) VALUES (${KEYS.map(
                () => '?'
            ).join(', ')})`,
            KEYS.map((x: string) => (element as any)[x])
        );
    } catch (e) {
        return Promise.reject(e);
    }
};

export const updateEvacuationStats = async (
    element: EvacuationStatsInterface
): Promise<ResultSet> => {
    try {
        const {evacuationId, ...others} = element;
        const KEYS = Object.keys(others);
        if (others.isDefault) {
            await SQLiteService.executeQuery(
                `UPDATE evacuationStats SET isDefault = 0 WHERE isDefault = 1;`
            );
        }

        return await SQLiteService.executeQuery(
            `UPDATE evacuationStats SET ${KEYS.map(
                (value: string) => `${value} = ?`
            ).join(', ')} WHERE evacuationId = ?;`,
            [...KEYS.map((x: string) => (others as any)[x]), evacuationId]
        );
    } catch (e) {
        return Promise.reject(e);
    }
};
