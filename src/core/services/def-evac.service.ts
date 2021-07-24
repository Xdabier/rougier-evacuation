import {ResultSet, SQLError} from 'react-native-sqlite-storage';
import SqlLiteService from './sql-lite.service';
import {DefEvacInterface} from '../interfaces/def-evac.interface';

const SQLiteService: SqlLiteService = new SqlLiteService();

export const getDefaultEvacId = async (
    close = false
): Promise<DefEvacInterface[]> => {
    try {
        const RES: ResultSet = await SQLiteService.executeQuery(
            `SELECT * FROM defaultEvacId;`
        );
        if (close && !SQLiteService.finished) {
            SQLiteService.db.close().catch((reason: SQLError) => {
                console.error('err defaultEvacId = ', reason);
            });
        }
        return RES.rows.raw() as DefEvacInterface[];
    } catch (e) {
        return Promise.reject(e);
    }
};

export const upsertDefaultEvacId = async (
    element: DefEvacInterface
): Promise<ResultSet> => {
    try {
        const DEF: DefEvacInterface[] = await getDefaultEvacId();
        if (DEF && DEF.length) {
            return await SQLiteService.executeQuery(
                `UPDATE defaultEvacId SET evacId = ? where id = 0`,
                [element.evacId]
            );
        }
        const KEYS = Object.keys(element);
        return await SQLiteService.executeQuery(
            `INSERT INTO defaultEvacId (${KEYS.join(', ')}) VALUES (${KEYS.map(
                () => '?'
            ).join(', ')})`,
            KEYS.map((x: string) => (element as any)[x])
        );
    } catch (e) {
        return Promise.reject(e);
    }
};
