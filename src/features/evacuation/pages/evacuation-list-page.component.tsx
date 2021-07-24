import * as React from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {FlatList, SafeAreaView, Text, ToastAndroid, View} from 'react-native';
import {useContext, useMemo, useState} from 'react';
import {publish as eventPub} from 'pubsub-js';
import {EvacuationScreenProps} from '../../../core/types/evacuation-screen-props.type';
import CommonStyles from '../../../styles';
import EvacuationCard from '../../../shared/components/evacuation-card/evacuation-card.component';
import MatButton from '../../../shared/components/mat-button.component';
import AddLogDetails from '../../../shared/components/add-log-modal/add-log-modal.component';
import {translate} from '../../../utils/i18n.utils';
import {MainStateContextInterface} from '../../../core/interfaces/main-state.interface';
import MainStateContext from '../../../core/contexts/main-state.context';
import {EvacuationAllDetailsInterface} from '../../../core/interfaces/evacuation-all-details.interface';
import AddEvacFileDetails from '../../../shared/components/add-evac-file-modal/add-evac-file-modal.component';
import EventTopicEnum from '../../../core/enum/event-topic.enum';
import syncForm from '../../../core/services/sync-logs.service';
import {requestServerEdit} from '../../../utils/modal.utils';

const {
    appPage,
    centerVertically,
    justifyAlignCenter,
    scrollView,
    vSpacer12,
    fabButtonView,
    fabButton,
    backgroundMain,
    pT2,
    pB60,
    noContent
} = CommonStyles;

const EvacuationListPage: React.FunctionComponent<EvacuationScreenProps> = ({
    navigation
}: any) => {
    const [addLogModalShow, setAddLogModalShow] = useState<boolean>(false);
    const [addEvacFileModalShow, setAddEvacFileModalShow] = useState<boolean>(
        false
    );
    const [oldEvac, setOldEvac] = useState<EvacuationAllDetailsInterface | null>(
        null
    );
    const [selectedEvacId, setSelectedEvacId] = useState<string>();

    const {
        gasolines,
        evacuationFiles,
        cubers,
        sites,
        serverData
    } = useContext<MainStateContextInterface>(MainStateContext);

    const onSyncClicked = async (evacuationForm: EvacuationAllDetailsInterface) => {
        try {
            if (serverData && evacuationForm) {
                eventPub(EventTopicEnum.setSpinner, true);
                const RES = await syncForm(evacuationForm, serverData);
                if (RES) {
                    ToastAndroid.show(
                        translate('common.succSync'),
                        ToastAndroid.SHORT
                    );
                }
                eventPub(EventTopicEnum.setSpinner, false);
                return;
            }

            if (!serverData) {
                requestServerEdit(() => {
                    navigation.navigate('settingsStack');
                    setTimeout(
                        () => eventPub(EventTopicEnum.showServerModal),
                        666
                    );
                });
            }
        } catch (e) {
            eventPub(EventTopicEnum.setSpinner, false);
            ToastAndroid.show(
                translate('common.syncError'),
                ToastAndroid.SHORT
            );
            throw Error(e);
        }
    };

    const notSyncedFiles = useMemo(
        () =>
            evacuationFiles.filter(
                (file: EvacuationAllDetailsInterface) =>
                    !file.allSynced && file.logsNumber
            ),
        [evacuationFiles]
    );

    const onSyncAllClicked = async () => {
        if (!serverData) {
            requestServerEdit(() => {
                navigation.navigate('settingsStack');
                setTimeout(() => eventPub(EventTopicEnum.showServerModal), 666);
            });
        }
        if (serverData && notSyncedFiles && notSyncedFiles.length) {
            try {
                eventPub(EventTopicEnum.setSpinner, true);
                const SYNC_ALL = notSyncedFiles.map(
                    (file: EvacuationAllDetailsInterface) =>
                        syncForm(file, serverData)
                );

                const RES = await Promise.all(SYNC_ALL);
                eventPub(EventTopicEnum.setSpinner, false);
                if (!RES.includes(0)) {
                    ToastAndroid.show(
                        translate('common.succAllSync'),
                        ToastAndroid.SHORT
                    );
                }
            } catch (e) {
                eventPub(EventTopicEnum.setSpinner, false);
                ToastAndroid.show(
                    translate('common.syncError'),
                    ToastAndroid.SHORT
                );
                throw Error(e);
            }
        }
    };

    const renderItem = ({item}: {item: EvacuationAllDetailsInterface}) => (
        <>
            <EvacuationCard
                evacuationFile={item}
                editEvac={() => {
                    setOldEvac(item);
                    setAddEvacFileModalShow(true);
                }}
                onAddLog={() => {
                    setSelectedEvacId(item.id);
                    setAddLogModalShow(true);
                }}
                syncEvac={() => {
                    onSyncClicked(item).then();
                }}
            />
            <View style={[vSpacer12]} />
        </>
    );

    return (
        <>
            <SafeAreaView style={[appPage]}>
                {evacuationFiles.length ? (
                    <FlatList
                        contentContainerStyle={[
                            centerVertically,
                            justifyAlignCenter,
                            scrollView,
                            pT2,
                            pB60
                        ]}
                        data={evacuationFiles}
                        renderItem={renderItem}
                        keyExtractor={(item, index) => `${index}`}
                    />
                ) : (
                    <View>
                        <Text style={[noContent]}>
                            {translate('evacuation.noContent')}
                        </Text>
                    </View>
                )}

                <AddLogDetails
                    evacuationFileId={selectedEvacId}
                    gasolineList={gasolines}
                    modalVisible={addLogModalShow}
                    onClose={(refresh: boolean | undefined) => {
                        setAddLogModalShow(false);

                        if (refresh) {
                            eventPub(EventTopicEnum.updateEvacuation);
                        }
                    }}
                />

                <AddEvacFileDetails
                    oldFile={oldEvac}
                    cubers={cubers}
                    sites={sites}
                    modalVisible={addEvacFileModalShow}
                    onClose={(refresh: boolean | undefined) => {
                        setAddEvacFileModalShow(false);
                        setOldEvac(null);

                        if (refresh) {
                            eventPub(EventTopicEnum.updateEvacuation);
                        }
                    }}
                />
            </SafeAreaView>

            <View style={[fabButtonView]}>
                <MatButton
                    isFab
                    isElevated
                    onPress={onSyncAllClicked}
                    disabled={!evacuationFiles.length || !notSyncedFiles.length}>
                    <View
                        style={[
                            centerVertically,
                            justifyAlignCenter,
                            fabButton,
                            backgroundMain
                        ]}>
                        <Icon name="sync" size={40} color="#fff" />
                    </View>
                </MatButton>
            </View>
        </>
    );
};

export default EvacuationListPage;
