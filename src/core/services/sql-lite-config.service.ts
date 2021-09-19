import {DatabaseParams, openDatabase} from 'react-native-sqlite-storage';

const PARAMS: DatabaseParams = {
    name: 'evacuation',
    location: 'default',
    createFromLocation: '~evacuation.db'
};

export default openDatabase(
    PARAMS,
    () => {},
    (err) => {
        console.error('DB ERR =>', err);
    }
);
