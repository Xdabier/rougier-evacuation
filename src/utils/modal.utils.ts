import {Alert, AlertButton} from 'react-native';
import {translate} from './i18n.utils';

export const requestCloseModal = (callback: () => void, msg?: string) => {
    const ALERT_BTNS: AlertButton[] = [
        {
            text: translate('common.no'),
            style: 'cancel'
        },
        {
            text: translate('common.yes'),
            style: 'default',
            onPress: () => {
                callback();
            }
        }
    ];
    Alert.alert(
        translate('closeModalAlert.title'),
        msg || translate('closeModalAlert.message'),
        ALERT_BTNS,
        {cancelable: true}
    );
};

export const requestServerEdit = (callback: () => void, msg?: string) => {
    const ALERT_BTNS: AlertButton[] = [
        {
            text: translate('noServerData.confirm'),
            style: 'default',
            onPress: () => {
                callback();
            }
        },
        {
            text: translate('noServerData.no'),
            style: 'cancel'
        }
    ];
    Alert.alert(
        translate('noServerData.title'),
        msg || translate('noServerData.message'),
        ALERT_BTNS,
        {cancelable: true}
    );
};
