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
    const [driver, setDriver] = useState<CuberInterface>();
    const [truckNumber, setTruckNumber] = useState<string>('');
    const [receiver, setReceiver] = useState<string>('');
    const [pointer, setPointer] = useState<string>('');
    const [startParc, setStartParc] = useState<SiteInterface>();
    const [arrivalParc, setArrivalParc] = useState<SiteInterface>();
    const [transporter, setTransporter] = useState<string>('');
    const [arrivalTime, setArrivalTime] = useState<Date>(new Date());
    const [departureTime, setDepartureTime] = useState<Date>(new Date());
    const [date, setDate] = useState<Date>(new Date());
    const [defaultEvacFile, setDefaultEvacFile] = useState<boolean>(true);

    const [selectedList, setSelectedList] = useState<
        'cubers' | 'sites' | 'none'
    >('none');

    const {keyboardHeight} = useContext<MainStateContextInterface>(
        MainStateContext
    );

    const validForm = () => !!(idValid && truckNumber && driver && date);

    const onSelectMenu = (list: 'cubers' | 'sites' | 'none'): void => {
        setSelectedList(list);
        if (list === 'none') {
            actionSheetRef.current?.setModalVisible(false);
        } else {
            actionSheetRef.current?.setModalVisible();
        }
    };

    const clearFields = () => {
        setId('');
        setDate(new Date());
        setArrivalTime(new Date());
        setDepartureTime(new Date());
        setDriver(undefined);
        setTruckNumber('');
        setPointer('');
        setReceiver('');
        setTransporter('');
    };

    useEffect(() => {
        if (oldFile) {
            setId(oldFile.id);
            setIdValid(true);
            setStartParc({
                name: oldFile.departureParcName,
                code: oldFile.departureParcCode
            });
            setArrivalParc({
                name: oldFile.arrivalParcName,
                code: oldFile.arrivalParcCode
            });
            setDate(new Date(oldFile.creationDate));
            setDefaultEvacFile(!!oldFile.isDefault);
        }
    }, [oldFile]);

    const checkIfOnlyDefaultChanged = () =>
        date.toISOString() === oldFile?.creationDate &&
        driver?.code === oldFile.driverCode;

    const confirmInsertion = () => {
        if (validForm() && driver && truckNumber) {
            const EL: EvacuationInterface = {
                id,
                creationDate: date.toISOString(),
                driver: driver.code,
                defaultEvacFile: defaultEvacFile ? 1 : 0,
                truckNumber,
                receiver,
                pointer,
                transporter,
                startParc: startParc ? startParc.code : '',
                arrivalParc: arrivalParc ? arrivalParc.code : '',
                arrivalTime: arrivalTime.toISOString(),
                departureTime: departureTime.toISOString()
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
                if (selectedList === 'cubers') {
                    setDriver(item);
                } else {
                    setSite(item);
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
                        selectedList === 'cubers'
                            ? 'engineering'
                            : 'photo-size-select-actual'
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
                    <FormInput
                        maxLength={8}
                        title={translate('modals.evacuation.fields.aac.label')}
                        placeholder={translate(
                            'modals.evacuation.fields.aac.ph'
                        )}
                        onChangeText={setAac}
                        value={aac}
                        pattern={[
                            '(99|[0-9]?[0-9])-(99|[0-9]?[0-9])-(99|[0-9]?[0-9])'
                        ]}
                        errText={translate('modals.evacuation.fields.aac.err')}
                        onValidation={setAacValid}
                        required
                    />
                    <SelectInput
                        title={translate(
                            'modals.evacuation.fields.cuber.label'
                        )}
                        placeholder={translate(
                            'modals.evacuation.fields.cuber.ph'
                        )}
                        showSelectMenu={() => {
                            onSelectMenu('cubers');
                        }}
                        value={cuber?.name}
                        required
                    />
                    <SelectInput
                        title={translate('modals.evacuation.fields.site.label')}
                        placeholder={translate(
                            'modals.evacuation.fields.site.ph'
                        )}
                        showSelectMenu={() => {
                            onSelectMenu('sites');
                        }}
                        value={site?.name}
                        required
                    />
                    <DateInput
                        title={translate('modals.evacuation.fields.date.label')}
                        value={date}
                        onDateChange={(newDate: Date) => {
                            setDate(newDate);
                        }}
                    />
                    <View style={[vSpacer25]} />
                    <FormCheckbox
                        value={defaultEvac}
                        onValueChange={setDefaultEvac}
                        title={translate(
                            'modals.evacuation.fields.evacAsDefault.label'
                        )}
                    />
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
                    valuesList={selectedList === 'cubers' ? cubers : sites}
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
