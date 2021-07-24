import React from 'react';
import {MainStateContextInterface} from '../interfaces/main-state.interface';

const MainStateContext: React.Context<MainStateContextInterface> = React.createContext<MainStateContextInterface>(
    {
        evacIds: [],
        gasolines: [],
        evacuationFiles: [],
        logs: [],
        sites: [],
        cubers: [],
        defaultEvac: {
            evacId: '',
            id: -1
        }
    }
);

export default MainStateContext;
