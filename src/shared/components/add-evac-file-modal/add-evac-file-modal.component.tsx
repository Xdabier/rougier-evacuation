import React, {
    createRef,
    RefObject,
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
import {SQLError} from 'react-native-sqlite-storage';
import CommonStyles, {
    FILTER_ROW_HEIGHT,
    MAIN_LIGHT_GREY,
    poppinsRegular
} from '../../../styles';
import ModalHeader from '../modal-header/modal-header.component';
import {translate} from '../../../utils/i18n.utils';
import ModalFooter from '../modal-footer/modal-footer.component';
import FormInput from '../form-input/form-input.component';
import DateInput from '../date-input/date-input.component';
import FormCheckbox from '../form-checkbox/form-checkbox.component';
import {CuberInterface} from '../../../core/interfaces/cuber.interface';
import {SiteInterface} from '../../../core/interfaces/site.interface';
import ActionSheetContent from '../action-sheet-content/action-sheet-content.component';
import MatButton from '../mat-button.component';
import SelectInput from '../select-input/select-input.component';
import {AuxiliaryInterface} from '../../../core/interfaces/auxiliary.interface';
import {EvacuationInterface} from '../../../core/interfaces/evacuation.interface';
import {
    insertEvacuationFile,
    updateEvacuation
} from '../../../core/services/evacuation.service';
import {EvacuationAllDetailsInterface} from '../../../core/interfaces/evacuation-all-details.interface';
import {requestCloseModal} from '../../../utils/modal.utils';
import {MainStateContextInterface} from '../../../core/interfaces/main-state.interface';
import MainStateContext from '../../../core/contexts/main-state.context';

const {
    fullWidth,
    appPage,
    vSpacer25,
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

type SelectedListType = 'driver' | 'arrivalParc' | 'departureParc' | 'none';

const actionSheetRef: RefObject<ActionSheetComponent> = createRef();

const AddEvacFileDetails: React.FunctionComponent<{
    modalVisible: boolean;
    cubers: CuberInterface[];
    sites: SiteInterface[];
    oldFile?: EvacuationAllDetailsInterface | null;
    onClose: (refresh?: boolean) => void;
}> = ({
    modalVisible,
    onClose,
    cubers,
    oldFile,
    sites
}: {
    modalVisible: boolean;
    onClose: (refresh?: boolean) => void;
    cubers: CuberInterface[];
    oldFile?: EvacuationAllDetailsInterface | null;
    sites: SiteInterface[];
}) => {
    const [id, setId] = useState<string>('');
    const [idValid, setIdValid] = useState<boolean | boolean[]>(true);
    const [receiverValid, setReceiverValid] = useState<boolean | boolean[]>(
        true
    );
    const [pointerValid, setPointerValid] = useState<boolean | boolean[]>(true);
    const [transporterValid, setTransporterValid] = useState<
        boolean | boolean[]
    >(true);
    const [truckNumberValid, setTruckNumberValid] = useState<
        boolean | boolean[]
    >(true);
    const [driver, setDriver] = useState<CuberInterface>();
    const [truckNumber, setTruckNumber] = useState<string>('');
    const [receiver, setReceiver] = useState<string>('');
    const [pointer, setPointer] = useState<string>('');
    const [departureParc, setDepartureParc] = useState<SiteInterface>();
    const [arrivalParc, setArrivalParc] = useState<SiteInterface>();
    const [transporter, setTransporter] = useState<string>('');
    const [arrivalTime, setArrivalTime] = useState<Date>(new Date());
    const [departureTime, setDepartureTime] = useState<Date>(new Date());
    const [date, setDate] = useState<Date>(new Date());
    const [defaultEvacFile, setDefaultEvacFile] = useState<boolean>(true);

    const [selectedList, setSelectedList] = useState<SelectedListType>('none');

    const {keyboardHeight} = useContext<MainStateContextInterface>(
        MainStateContext
    );

    const validForm = () =>
        !!(
            idValid &&
            truckNumberValid &&
            driver &&
            truckNumber &&
            date &&
            pointerValid &&
            receiverValid &&
            transporterValid
        );

    const onSelectMenu = (list: SelectedListType): void => {
        setSelectedList(list);
        if (list === 'none') {
            actionSheetRef.current?.setModalVisible(false);
        } else {
            actionSheetRef.current?.setModalVisible();
        }
    };

    const clearFields = () => {
        setId('');
        setTransporter('');
        setReceiver('');
        setTruckNumber('');
        setPointer('');
        setIdValid(false);
        setDate(new Date());
        setDriver(undefined);
        setDepartureParc(undefined);
        setArrivalParc(undefined);
        setDepartureTime(new Date());
        setArrivalTime(new Date());
    };

    useEffect(() => {
        if (oldFile) {
            setId(oldFile.id);
            setIdValid(true);
            setDriver({
                name: oldFile.driverName,
                code: oldFile.driverCode
            });
            setDepartureParc({
                name: oldFile.departureParcName,
                code: oldFile.departureParcCode
            });
            setArrivalParc({
                name: oldFile.arrivalParcName,
                code: oldFile.arrivalParcCode
            });
            setDate(new Date(oldFile.creationDate));
            setDepartureTime(new Date(oldFile.departureTime));
            setArrivalTime(new Date(oldFile.arrivalTime));
            setTruckNumber(oldFile.truckNumber);
            setTransporter(oldFile.transporter);
            setPointer(oldFile.pointer);
            setReceiver(oldFile.receiver);
            setDefaultEvacFile(!!oldFile.isDefault);
        }
    }, [oldFile]);

    const checkIfOnlyDefaultChanged = () =>
        date.toISOString() === oldFile?.creationDate &&
        departureTime.toISOString() === oldFile?.departureTime &&
        arrivalTime.toISOString() === oldFile?.arrivalTime &&
        driver?.code === oldFile.driverCode &&
        departureParc?.code === oldFile.departureParcCode &&
        truckNumber === oldFile.truckNumber &&
        pointer === oldFile.pointer &&
        receiver === oldFile.receiver &&
        transporter === oldFile.transporter &&
        arrivalParc?.code === oldFile.arrivalParcCode;

    const confirmInsertion = () => {
        if (validForm() && driver) {
            const EL: EvacuationInterface = {
                id,
                creationDate: date.toISOString(),
                defaultEvacFile: defaultEvacFile ? 1 : 0,
                departureParc:
                    departureParc && departureParc.code
                        ? departureParc.code
                        : undefined,
                arrivalParc:
                    arrivalParc && arrivalParc.code
                        ? arrivalParc.code
                        : undefined,
                driver: driver.code,
                arrivalTime: arrivalTime.toISOString(),
                departureTime: departureTime.toISOString(),
                truckNumber,
                transporter: transporter || undefined,
                pointer: pointer || undefined,
                receiver: receiver || undefined
            };

            if (oldFile) {
                EL.id = `${oldFile.id}`;
                updateEvacuation(EL, !checkIfOnlyDefaultChanged())
                    .then((res) => {
                        if (res && res.rows) {
                            clearFields();
                            onClose(true);
                            ToastAndroid.show(
                                translate('modals.evacuation.succMsgEdit'),
                                ToastAndroid.SHORT
                            );
                        }
                    })
                    .catch((reason: SQLError) => {
                        if (!reason.code) {
                            ToastAndroid.show(
                                translate('common.dupErr'),
                                ToastAndroid.LONG
                            );
                        }
                    });
            } else {
                insertEvacuationFile(EL)
                    .then((res) => {
                        if (res && res.rows) {
                            clearFields();
                            onClose(true);
                            ToastAndroid.show(
                                translate('modals.evacuation.succMsg'),
                                ToastAndroid.SHORT
                            );
                        }
                    })
                    .catch((reason: SQLError) => {
                        if (!reason.code) {
                            ToastAndroid.show(
                                translate('common.dupErr'),
                                ToastAndroid.LONG
                            );
                        }
                    });
            }
        } else {
            ToastAndroid.show(translate('common.validErr'), ToastAndroid.LONG);
        }
    };

    const renderFilterBtn = (
        {item}: {item: AuxiliaryInterface},
        _i: number
    ) => (
        <MatButton
            onPress={() => {
                switch (selectedList) {
                    case 'arrivalParc':
                        setArrivalParc(item);
                        break;
                    case 'departureParc':
                        setDepartureParc(item);
                        break;
                    case 'driver':
                        setDriver(item);
                        break;
                    default:
                        break;
                }

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
                    name={
                        // eslint-disable-next-line no-nested-ternary
                        selectedList === 'driver'
                            ? 'engineering'
                            : selectedList === 'departureParc'
                            ? 'flight-takeoff'
                            : 'flight-land'
                    }
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
                    clearFields();
                    onClose();
                });
            }}
            animationType="slide"
            visible={modalVisible}>
            <ModalHeader
                title={translate(
                    oldFile
                        ? 'common.editEvacuationFile'
                        : 'common.addEvacuationFile'
                )}
                onClose={() => {
                    requestCloseModal(() => {
                        clearFields();
                        onClose();
                    });
                }}
            />
            <SafeAreaView style={[appPage]}>
                <ScrollView>
                    <FormInput
                        maxLength={25}
                        title={translate('modals.evacuation.fields.id.label')}
                        placeholder={translate(
                            'modals.evacuation.fields.id.ph'
                        )}
                        onChangeText={setId}
                        value={id}
                        pattern={['^(.){3,}$']}
                        errText={translate('modals.evacuation.fields.id.err')}
                        onValidation={setIdValid}
                        disabled={!!oldFile && !!oldFile?.id}
                        required
                    />
                    <SelectInput
                        title={translate(
                            'modals.evacuation.fields.driver.label'
                        )}
                        placeholder={translate(
                            'modals.evacuation.fields.driver.ph'
                        )}
                        showSelectMenu={() => {
                            onSelectMenu('driver');
                        }}
                        value={driver?.name}
                        required
                    />
                    <FormInput
                        maxLength={25}
                        title={translate(
                            'modals.evacuation.fields.truckNumber.label'
                        )}
                        placeholder={translate(
                            'modals.evacuation.fields.truckNumber.ph'
                        )}
                        onChangeText={setTruckNumber}
                        value={truckNumber}
                        pattern={['^(.){3,}$']}
                        errText={translate(
                            'modals.evacuation.fields.truckNumber.err'
                        )}
                        onValidation={setTruckNumberValid}
                        required
                    />
                    <DateInput
                        title={translate('modals.evacuation.fields.date.label')}
                        value={date}
                        onDateChange={(newDate: Date) => {
                            setDate(newDate);
                        }}
                        required
                    />
                    <SelectInput
                        title={translate(
                            'modals.evacuation.fields.departureParc.label'
                        )}
                        placeholder={translate(
                            'modals.evacuation.fields.departureParc.ph'
                        )}
                        showSelectMenu={() => {
                            onSelectMenu('departureParc');
                        }}
                        value={departureParc?.name}
                    />
                    <SelectInput
                        title={translate(
                            'modals.evacuation.fields.arrivalParc.label'
                        )}
                        placeholder={translate(
                            'modals.evacuation.fields.arrivalParc.ph'
                        )}
                        showSelectMenu={() => {
                            onSelectMenu('arrivalParc');
                        }}
                        value={arrivalParc?.name}
                    />
                    <DateInput
                        title={translate(
                            'modals.evacuation.fields.departureTime.label'
                        )}
                        value={departureTime}
                        onDateChange={(newDate: Date) => {
                            setDepartureTime(newDate);
                        }}
                        mode="time"
                    />
                    <DateInput
                        title={translate(
                            'modals.evacuation.fields.arrivalTime.label'
                        )}
                        value={arrivalTime}
                        onDateChange={(newDate: Date) => {
                            setArrivalTime(newDate);
                        }}
                        mode="time"
                    />
                    <FormInput
                        maxLength={25}
                        title={translate(
                            'modals.evacuation.fields.receiver.label'
                        )}
                        placeholder={translate(
                            'modals.evacuation.fields.receiver.ph'
                        )}
                        onChangeText={setReceiver}
                        value={receiver}
                        pattern={['^(\\S{3,})?$']}
                        errText={translate(
                            'modals.evacuation.fields.receiver.err'
                        )}
                        onValidation={setReceiverValid}
                    />
                    <FormInput
                        maxLength={25}
                        title={translate(
                            'modals.evacuation.fields.pointer.label'
                        )}
                        placeholder={translate(
                            'modals.evacuation.fields.pointer.ph'
                        )}
                        onChangeText={setPointer}
                        value={pointer}
                        pattern={['^(\\S{3,})?$']}
                        errText={translate(
                            'modals.evacuation.fields.pointer.err'
                        )}
                        onValidation={setPointerValid}
                    />
                    <FormInput
                        maxLength={25}
                        title={translate(
                            'modals.evacuation.fields.transporter.label'
                        )}
                        placeholder={translate(
                            'modals.evacuation.fields.transporter.ph'
                        )}
                        onChangeText={setTransporter}
                        value={transporter}
                        pattern={['^(\\S{3,})?$']}
                        errText={translate(
                            'modals.evacuation.fields.transporter.err'
                        )}
                        onValidation={setTransporterValid}
                    />
                    <View style={[vSpacer25]} />
                    <FormCheckbox
                        value={defaultEvacFile}
                        onValueChange={setDefaultEvacFile}
                        title={translate(
                            'modals.evacuation.fields.evacAsDefault.label'
                        )}
                    />
                    <View style={[vSpacer25]} />
                    <View style={[vSpacer25]} />
                    <View style={[vSpacer25]} />
                    <View style={[vSpacer25]} />
                    <View style={[vSpacer25]} />
                </ScrollView>
            </SafeAreaView>
            <ModalFooter
                disabled={!validForm()}
                onPress={confirmInsertion}
                title={translate('modals.evacuation.confirm')}
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
                    valuesList={selectedList === 'driver' ? cubers : sites}
                    renderElement={renderFilterBtn}
                />
            </ActionSheetComponent>
        </Modal>
    );
};

AddEvacFileDetails.defaultProps = {
    oldFile: null
};

export default AddEvacFileDetails;
