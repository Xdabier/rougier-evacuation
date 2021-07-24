import {EvacuationInterface} from './evacuation.interface';
import {LogInterface} from './log.interface';

export interface SyncDataInterface extends EvacuationInterface {
    logs: LogInterface[];
}
