import {Alert, AlertButton} from 'react-native';
import {translate} from './i18n.utils';

const requestCloseModal = (callback: () => void, msg?: string) => {
    const ALERT_BTNS: AlertButton[] = [
        {
            text: translate('common.yes'),
            style: 'default',
            onPress: () => {
                callback();
            }
        },
        {
            text: translate('common.no'),
            style: 'cancel'
        }
    ];
    Alert.alert(
        translate('closeModalAlert.title'),
        msg || translate('closeModalAlert.message'),
        ALERT_BTNS,
        {cancelable: true}
    );
};

export default requestCloseModal;
