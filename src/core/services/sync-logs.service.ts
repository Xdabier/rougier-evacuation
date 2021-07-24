import {ToastAndroid} from 'react-native';
import {publish as eventPub} from 'pubsub-js';
import {EvacuationAllDetailsInterface} from '../interfaces/evacuation-all-details.interface';
import {translate} from '../../utils/i18n.utils';
import {convertSyncFile, generateSingleSyncFile} from './sync-tools.service';
import sendToOdoo from './odoo-connect.service';
import {ServerInterface} from '../interfaces/server.interface';
import {updateSyncEvacuationFile} from './evacuation.service';
import EventTopicEnum from '../enum/event-topic.enum';

const syncSingleForm = async (
    evacForm: EvacuationAllDetailsInterface,
    serverData: ServerInterface
): Promise<number> => {
    if (!evacForm.logsNumber) {
        ToastAndroid.show(translate('syncErrors.noLogs'), ToastAndroid.SHORT);
        return 0;
    }

    if (evacForm.allSynced) {
        ToastAndroid.show(
            translate('syncErrors.allSynced'),
            ToastAndroid.SHORT
        );
        return 0;
    }

    if (evacForm?.id) {
        try {
            const SYNC_DATA = await generateSingleSyncFile(evacForm?.id);
            const RES = await sendToOdoo(
                serverData,
                convertSyncFile(SYNC_DATA)
            );

            if (RES) {
                const DB_RES = updateSyncEvacuationFile(evacForm?.id, 1);

                if (DB_RES) {
                    eventPub(EventTopicEnum.updateEvacuation);
                    return RES;
                }
            }
        } catch (e) {
            throw Error(e);
        }
    }

    return 0;
};

export default syncSingleForm;
