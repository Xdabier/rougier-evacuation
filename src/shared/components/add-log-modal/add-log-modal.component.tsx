import React, {
    createRef,
    RefObject,
    useCallback,
    useContext,
    useEffect,
    useState
} from 'react';
import {
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    ToastAndroid,
    View
} from 'react-native';
import ActionSheetComponent from 'react-native-actions-sheet';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {ResultSet, SQLError} from 'react-native-sqlite-storage';
import CommonStyles, {
    FILTER_ROW_HEIGHT,
    MAIN_LIGHT_GREY,
    poppinsRegular
} from '../../../styles';
import ModalHeader from '../modal-header/modal-header.component';
import {translate} from '../../../utils/i18n.utils';
import ModalFooter from '../modal-footer/modal-footer.component';
import FormInput from '../form-input/form-input.component';
import ActionSheetContent from '../action-sheet-content/action-sheet-content.component';
import {GasolineInterface} from '../../../core/interfaces/gasoline.interface';
import {AuxiliaryInterface} from '../../../core/interfaces/auxiliary.interface';
import MatButton from '../mat-button.component';
import SelectInput from '../select-input/select-input.component';
import {
    LogDetailsInterface,
    LogInterface
} from '../../../core/interfaces/log.interface';
import {MainStateContextInterface} from '../../../core/interfaces/main-state.interface';
import MainStateContext from '../../../core/contexts/main-state.context';
import {insertLog, updateLog} from '../../../core/services/logs.service';
import CameraModal from '../camera-modal/camera-modal.component';
import {requestCloseModal} from '../../../utils/modal.utils';

const {
    fullWidth,
    appPage,
    vSpacer100,
    scrollView,
    centerHorizontally,
    justifyAlignTLeftHorizontal,
    alignCenter
} = CommonStyles;

const TEXT_LINE_HEIGHT = 27;
const STYLES = StyleSheet.create({
    searchResult: {
        height: FILTER_ROW_HEIGHT,
        borderBottomWidth: 1,
        borderBottomColor: MAIN_LIGHT_GREY
    },
    searchResultText: {
        marginLeft: 18,
        fontFamily: poppinsRegular,
        fontSize: 16,
        lineHeight: TEXT_LINE_HEIGHT
    }
});

const actionSheetRef: RefObject<ActionSheetComponent> = createRef();

const AddLogDetails: React.FunctionComponent<{
    modalVisible: boolean;
    evacuationFileId?: string | null;
    scannedBarCode?: string | null;
    oldLog?: LogDetailsInterface | null;
    gasolineList: GasolineInterface[];
    onClose: (refresh?: boolean) => void;
}> = ({
    modalVisible,
    onClose,
    oldLog,
    scannedBarCode,
    evacuationFileId,
    gasolineList
}: {
    modalVisible: boolean;
    evacuationFileId?: string | null;
    scannedBarCode?: string | null;
    oldLog?: LogDetailsInterface | null;
    onClose: (refresh?: boolean) => void;
    gasolineList: GasolineInterface[];
}) => {
    const [cameraModalShow, setCameraModalShow] = useState<boolean>(false);
    const [barCode, setBarCode] = useState<string>(scannedBarCode || '');
    const [logging, setLogging] = useState<string>('');
    const [comment, setComment] = useState<string>('');
    const [index, setIndex] = useState<string>('');
    const [id, setId] = useState<string>('');
    const [gasoline, setGasoline] = useState<GasolineInterface>({
        code: '',
        name: ''
    });
    const [dgb, setDgb] = useState<string>('');
    const [dpb, setDpb] = useState<string>('');
    const [lengthVal, setLengthVal] = useState<string>('');
    const [diameterAvg, setDiameterAvg] = useState<string>('');
    const [volume, setVolume] = useState<string>('');
    const [quality, setQuality] = useState<string>('');
    const [status, setStatus] = useState<string>('');
    const [patternStatus, setPatternStatus] = useState<string>('');

    const {defaultEvac, keyboardHeight} = useContext<MainStateContextInterface>(
        MainStateContext
    );

    const setVolumeFn = (_lengthVal: number, _diameter: number) =>
        _lengthVal && _diameter
            ? ((Math.PI / 4) * (_diameter * _diameter) * _lengthVal) / 1000000
            : 0;

    const onLengthChange = (text: string) => {
        setLengthVal(text);
        setVolume(`${setVolumeFn(+text, +diameterAvg).toFixed(3)}`);
    };

    const onLoggingIndexingChange = (
        value: string,
        type: 'logging' | 'indexing'
    ) => {
        if (type === 'indexing') {
            setIndex(value);
            if (value.length || logging.length) {
                setId(`${logging || ''}/${value}`);
            } else if (!value.length || !logging.length) {
                setId('');
            }
        }

        if (type === 'logging') {
            setLogging(value);
            if (value.length || index.length) {
                setId(`${value}/${index || ''}`);
            } else if (!value.length || !index.length) {
                setId('');
            }
        }
    };

    const setDiameterAndVolume = (dgbVal: number, dpbVal: number) => {
        const FN = (dgbVal + dpbVal) / 2;
        const NON_NAN = Number.isNaN(FN) ? 0 : FN;

        const VOLUME =
            NON_NAN && lengthVal ? setVolumeFn(+lengthVal, NON_NAN) : 0;
        setVolume(`${VOLUME}`);
        setDiameterAvg(`${!NON_NAN ? '' : NON_NAN}`);
    };

    const onDgbDpbChange = (value: string, type: 'dgb' | 'dpb') => {
        if (type === 'dgb') {
            setDgb(value);
            if (dpb.length || value.length) {
                setDiameterAndVolume(+value, +dpb);
            } else if (!value.length || !logging.length) {
                setDiameterAvg('');
            }
        }

        if (type === 'dpb') {
            setDpb(value);
            if (value.length || dgb.length) {
                setDiameterAndVolume(+dgb, +value);
            } else if (!value.length || !index.length) {
                setDiameterAvg('');
            }
        }
    };

    const resetFields = useCallback(
        (data?: LogDetailsInterface) => {
            setGasoline(
                data
                    ? {
                          code: data.gasCode,
                          name: data.gasName
                      }
                    : {
                          code: '',
                          name: ''
                      }
            );
            setBarCode(data ? data.barCode : '');
            setVolume(data ? `${data.volume}` : '');
            setLengthVal(data ? `${data.lengthVal}` : '');
            setLogging(data ? `${data.logging}` : '');
            setIndex(data ? `${data.indicator}` : '');
            setDgb(data ? `${data.dgb}` : '');
            setDpb(data ? `${data.dpb}` : '');
            setId(data ? `${data.id}` : '');
            setDiameterAvg(data ? `${data.diameter}` : '');
            setQuality(data ? `${data.quality}` : '');
            setStatus(data ? `${data.status}` : '');
            setPatternStatus(data ? `${data.statusPattern}` : '');
            setComment(data ? `${data.comment}` : '');

            if (scannedBarCode && !data) {
                setBarCode(scannedBarCode);
            }
        },
        [scannedBarCode]
    );

    useEffect(() => {
        if (oldLog) {
            resetFields(oldLog);
        } else {
            resetFields();
        }
    }, [modalVisible, oldLog, resetFields]);

    const validForm = () =>
        barCode &&
        barCode.length >= 6 &&
        logging &&
        logging.length >= 1 &&
        index &&
        index.length >= 1 &&
        gasoline &&
        dgb &&
        dgb.length >= 1 &&
        dpb &&
        dpb.length >= 1 &&
        lengthVal &&
        lengthVal.length >= 1 &&
        diameterAvg &&
        diameterAvg.length >= 1 &&
        volume &&
        volume.length >= 1;

    const confirmInsertion = () => {
        if (
            validForm() &&
            gasoline &&
            defaultEvac &&
            Object.keys(defaultEvac).length
        ) {
            const EL: LogInterface = {
                id,
                creationDate: new Date().toISOString(),
                evacuationId:
                    evacuationFileId && evacuationFileId.length
                        ? evacuationFileId
                        : defaultEvac.evacId,
                barCode,
                dgb: +dgb,
                diameter: +diameterAvg,
                dpb: +dpb,
                gasoline: gasoline.code,
                indicator: +index,
                logging: +logging,
                quality,
                status,
                lengthVal: +lengthVal,
                statusPattern: patternStatus,
                volume: +volume,
                comment: comment || undefined
            };

            if (oldLog) {
                EL.evacuationId = oldLog.evacuationId;
                updateLog(oldLog.id, EL)
                    .then((res: ResultSet) => {
                        if (res && res.rows) {
                            resetFields();
                            onClose(true);
                            ToastAndroid.show(
                                translate('modals.logs.succMsgEdit'),
                                ToastAndroid.SHORT
                            );
                        }
                    })
                    .catch((reason: SQLError) => {
                        console.error('er = ', reason);
                        if (!reason.code) {
                            ToastAndroid.show(
                                translate('common.dupErr'),
                                ToastAndroid.LONG
                            );
                        }
                    });
            } else {
                insertLog(EL)
                    .then((res: ResultSet) => {
                        console.log('res = ', res);
                        if (res && res.rows) {
                            resetFields();
                            onClose(true);
                            ToastAndroid.show(
                                translate('modals.logs.succMsg'),
                                ToastAndroid.SHORT
                            );
                        }
                    })
                    .catch((reason: SQLError) => {
                        console.log('er = ', reason);
                        if (!reason.code) {
                            ToastAndroid.show(
                                translate('common.dupErr'),
                                ToastAndroid.LONG
                            );
                        }
                    });
            }
        } else {
            ToastAndroid.show(
                'Ne default evac, or one of the fields is wrong.',
                ToastAndroid.LONG
            );
        }
    };

    const onSelectMenu = (visible = true): void => {
        actionSheetRef.current?.setModalVisible(visible);
    };

    const renderFilterBtn = (
        {item}: {item: AuxiliaryInterface},
        _i: number
    ) => (
        <MatButton
            onPress={() => {
                setGasoline(item);
                actionSheetRef.current?.setModalVisible(false);
            }}
            key={_i}>
            <View
                style={[
                    scrollView,
                    centerHorizontally,
                    justifyAlignTLeftHorizontal,
                    alignCenter,
                    STYLES.searchResult
                ]}>
                <Icon
                    name="ev-station"
                    size={TEXT_LINE_HEIGHT}
                    color={MAIN_LIGHT_GREY}
                />
                <Text style={[STYLES.searchResultText]}>{item.name}</Text>
            </View>
        </MatButton>
    );

    return (
        <Modal
            style={[fullWidth]}
            onRequestClose={() => {
                requestCloseModal(() => {
                    resetFields();
                    onClose();
                });
            }}
            animationType="slide"
            visible={modalVisible}>
            <ModalHeader
                scanCode
                onBarCodeScanner={() => setCameraModalShow(true)}
                title={translate(oldLog ? 'common.editLog' : 'common.addLog')}
                onClose={() => {
                    requestCloseModal(() => {
                        resetFields();
                        onClose();
                    });
                }}
            />
            <SafeAreaView style={[appPage]}>
                <ScrollView>
                    <FormInput
                        title={translate('modals.logs.fields.barCode.label')}
                        placeholder={translate('modals.logs.fields.barCode.ph')}
                        onChangeText={setBarCode}
                        keyboardType="number-pad"
                        value={barCode}
                        required
                    />
                    <FormInput
                        title={translate('modals.logs.fields.logging.label')}
                        placeholder={translate('modals.logs.fields.logging.ph')}
                        onChangeText={(text) => {
                            onLoggingIndexingChange(text, 'logging');
                        }}
                        keyboardType="number-pad"
                        value={logging}
                        required
                    />
                    <FormInput
                        title={translate('modals.logs.fields.index.label')}
                        placeholder={translate('modals.logs.fields.index.ph')}
                        onChangeText={(text) => {
                            onLoggingIndexingChange(text, 'indexing');
                        }}
                        keyboardType="number-pad"
                        value={index}
                        required
                    />
                    <FormInput
                        title={translate('modals.logs.fields.id.label')}
                        placeholder={translate('modals.logs.fields.id.ph')}
                        onChangeText={setId}
                        value={id}
                        disabled
                        required
                    />
                    <SelectInput
                        title={translate('modals.logs.fields.gasoline.label')}
                        placeholder={translate(
                            'modals.logs.fields.gasoline.ph'
                        )}
                        showSelectMenu={onSelectMenu}
                        value={gasoline?.name}
                        required
                    />
                    <FormInput
                        title={translate('modals.logs.fields.dgb.label')}
                        placeholder={translate('modals.logs.fields.dgb.ph')}
                        onChangeText={(text) => {
                            onDgbDpbChange(text, 'dgb');
                        }}
                        keyboardType="number-pad"
                        value={dgb}
                        required
                    />
                    <FormInput
                        title={translate('modals.logs.fields.dpb.label')}
                        placeholder={translate('modals.logs.fields.dpb.ph')}
                        onChangeText={(text) => {
                            onDgbDpbChange(text, 'dpb');
                        }}
                        keyboardType="number-pad"
                        value={dpb}
                        required
                    />
                    <FormInput
                        title={translate('modals.logs.fields.length.label')}
                        placeholder={translate('modals.logs.fields.length.ph')}
                        onChangeText={onLengthChange}
                        value={lengthVal}
                        keyboardType="number-pad"
                        required
                    />
                    <FormInput
                        title={translate(
                            'modals.logs.fields.diameterAvg.label'
                        )}
                        placeholder={translate(
                            'modals.logs.fields.diameterAvg.ph'
                        )}
                        onChangeText={setDiameterAvg}
                        value={diameterAvg}
                        disabled
                        required
                    />
                    <FormInput
                        title={translate('modals.logs.fields.volume.label')}
                        placeholder={translate('modals.logs.fields.volume.ph')}
                        onChangeText={setVolume}
                        value={volume}
                        disabled
                        required
                    />
                    <FormInput
                        title={translate('modals.logs.fields.quality.label')}
                        placeholder={translate('modals.logs.fields.quality.ph')}
                        onChangeText={setQuality}
                        value={quality}
                        required
                    />
                    <FormInput
                        title={translate('modals.logs.fields.status.label')}
                        placeholder={translate('modals.logs.fields.status.ph')}
                        onChangeText={setStatus}
                        value={status}
                    />
                    <FormInput
                        title={translate(
                            'modals.logs.fields.patternStatus.label'
                        )}
                        placeholder={translate(
                            'modals.logs.fields.patternStatus.ph'
                        )}
                        onChangeText={setPatternStatus}
                        value={patternStatus}
                    />
                    <FormInput
                        title={translate('modals.logs.fields.comments.label')}
                        placeholder={translate(
                            'modals.logs.fields.comments.ph'
                        )}
                        onChangeText={setComment}
                        value={comment}
                    />
                    <View style={[vSpacer100]} />
                </ScrollView>
            </SafeAreaView>
            <ModalFooter
                disabled={!validForm()}
                onPress={confirmInsertion}
                title={translate('modals.logs.confirm')}
            />

            <ActionSheetComponent
                initialOffsetFromBottom={0.6}
                ref={actionSheetRef}
                statusBarTranslucent
                bounceOnOpen
                bounciness={4}
                gestureEnabled
                defaultOverlayOpacity={0.3}>
                <ActionSheetContent
                    keyboardHeight={keyboardHeight}
                    actionSheetRef={actionSheetRef}
                    valuesList={gasolineList || []}
                    renderElement={renderFilterBtn}
                />
            </ActionSheetComponent>

            <CameraModal
                modalVisible={cameraModalShow}
                onClose={(code?: string) => {
                    setCameraModalShow(false);

                    if (code && code.length) {
                        setBarCode(code);
                    }
                }}
                modalName={translate('common.scanBarCode')}
            />
        </Modal>
    );
};

AddLogDetails.defaultProps = {
    evacuationFileId: null,
    oldLog: null,
    scannedBarCode: null
};

export default AddLogDetails;
