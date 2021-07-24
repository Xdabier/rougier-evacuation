import {CuberInterface} from './cuber.interface';
import {SiteInterface} from './site.interface';
import {DefEvacInterface} from './def-evac.interface';
import {GasolineInterface} from './gasoline.interface';
import {LogDetailsInterface} from './log.interface';
import {UserInterface} from './user.interface';
import {EvacuationAllDetailsInterface} from './evacuation-all-details.interface';
import {ServerInterface} from './server.interface';

export interface MainStateContextInterface {
    setFilteringId?: (v: string) => void;
    filteringId?: string;
    keyboardHeight?: number;
    setServerData?: (v: ServerInterface) => void;
    serverData?: ServerInterface;
    setUser?: (v: UserInterface) => void;
    user?: UserInterface;
    setDefaultEvac?: (v: DefEvacInterface) => void;
    defaultEvac: DefEvacInterface;
    setCubers?: (v: CuberInterface | CuberInterface[]) => void;
    cubers: CuberInterface[];
    setEvacIds?: (v: string | string[]) => void;
    evacIds: string[];
    setSites?: (v: SiteInterface | SiteInterface[]) => void;
    sites: SiteInterface[];
    setGasoline?: (v: GasolineInterface | GasolineInterface[]) => void;
    gasolines: GasolineInterface[];
    setLogs?: (v: LogDetailsInterface | LogDetailsInterface[]) => void;
    logs: LogDetailsInterface[];
    setEvacuationFiles?: (
        v: EvacuationAllDetailsInterface | EvacuationAllDetailsInterface[]
    ) => void;
    evacuationFiles: EvacuationAllDetailsInterface[];
    setHomeEvacuationFile?: (v: EvacuationAllDetailsInterface) => void;
    homeEvacuationFile?: EvacuationAllDetailsInterface | null;
}
