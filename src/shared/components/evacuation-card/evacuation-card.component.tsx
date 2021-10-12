import React from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {Dimensions, StyleSheet, Text, View} from 'react-native';
import CommonStyles, {
    BORDER_RADIUS,
    MAIN_GREEN,
    MAIN_RED,
    PADDING_HORIZONTAL,
    poppinsRegular
} from '../../../styles';
import {translate} from '../../../utils/i18n.utils';
import MatButton from '../mat-button.component';
import {EvacuationAllDetailsInterface} from '../../../core/interfaces/evacuation-all-details.interface';

const {
    mainColor,
    centerHorizontally,
    centerVertically,
    spaceBetween,
    alignCenter,
    rougierShadow,
    regularFont,
    textAlignLeft,
    justifyAlignLeftVertical,
    justifyAlignRightVertical,
    justifyAlignRightHorizontal,
    justifyCenter,
    info,
    title,
    subTitle,
    hSpacer5
} = CommonStyles;

const STYLES = StyleSheet.create({
    firstHalfOfCard: {
        maxWidth: '55%'
    },
    mainView: {
        width: Dimensions.get('screen').width - (PADDING_HORIZONTAL + 2) * 2,
        padding: 11,
        borderRadius: BORDER_RADIUS,
        backgroundColor: '#fff'
    },
    button: {
        minWidth: 111,
        paddingVertical: 7,
        paddingHorizontal: 10,
        borderRadius: BORDER_RADIUS
    },
    buttonFill: {
        backgroundColor: MAIN_RED
    },
    buttonFillConfirmed: {
        backgroundColor: MAIN_GREEN
    },
    buttonClear: {
        backgroundColor: '#fff'
    },
    buttonText: {
        lineHeight: 20,
        fontFamily: poppinsRegular,
        fontSize: 13,
        marginLeft: 6
    },
    buttonTextFill: {
        color: '#fff'
    },
    buttonTextClear: {
        color: MAIN_RED
    },
    defCardCapsule: {
        borderRadius: BORDER_RADIUS,
        paddingHorizontal: 5,
        paddingVertical: 2,
        backgroundColor: 'rgba(69, 96, 14, .3)'
    },
    defCardIdx: {
        fontSize: 10,
        color: MAIN_GREEN
    }
});

const EvacuationCard: React.FunctionComponent<{
    evacuationFile: EvacuationAllDetailsInterface;
    onAddLog: () => void;
    editEvac?: () => void;
    syncEvac?: () => void;
}> = ({
    evacuationFile,
    onAddLog,
    editEvac,
    syncEvac
}: {
    evacuationFile: EvacuationAllDetailsInterface;
    onAddLog: () => void;
    editEvac?: () => void;
    syncEvac?: () => void;
}) => (
    <View
        style={[
            STYLES.mainView,
            centerHorizontally,
            spaceBetween,
            alignCenter,
            rougierShadow
        ]}>
        <View
            style={[
                STYLES.firstHalfOfCard,
                centerVertically,
                justifyAlignLeftVertical,
                justifyCenter
            ]}>
            <Text style={[mainColor, title, regularFont, textAlignLeft]}>
                {translate('common.id')}{' '}
                <Text style={[mainColor, subTitle, regularFont, textAlignLeft]}>
                    {evacuationFile.id}
                </Text>
                <View style={[hSpacer5]} />
                {evacuationFile.isDefault ? (
                    <View style={[STYLES.defCardCapsule]}>
                        <Text style={[STYLES.defCardIdx]}>
                            {translate('common.default')}
                        </Text>
                    </View>
                ) : (
                    <View />
                )}
            </Text>
            <Text style={[info, regularFont, textAlignLeft]}>
                {`${translate('modals.evacuation.fields.driver.label')}: ${
                    evacuationFile.driverName
                }`}
            </Text>
            <Text style={[info, regularFont, textAlignLeft]}>
                {`${translate('modals.evacuation.fields.truckNumber.label')}: ${
                    evacuationFile.truckNumber
                }`}
            </Text>
            {evacuationFile.transporter && (
                <Text style={[info, regularFont, textAlignLeft]}>
                    {`${translate(
                        'modals.evacuation.fields.transporter.label'
                    )}: ${evacuationFile.transporter}`}
                </Text>
            )}
            {evacuationFile.departureParcName && (
                <Text style={[info, regularFont, textAlignLeft]}>
                    {`${translate(
                        'modals.evacuation.fields.departureParc.label'
                    )}: ${evacuationFile.departureParcName}`}
                </Text>
            )}
            {evacuationFile.arrivalParcName && (
                <Text style={[info, regularFont, textAlignLeft]}>
                    {`${translate(
                        'modals.evacuation.fields.arrivalParc.label'
                    )}: ${evacuationFile.arrivalParcName}`}
                </Text>
            )}
            <Text style={[info, regularFont, textAlignLeft]}>
                {translate('common.creationDate', {
                    date: new Date(
                        evacuationFile.creationDate
                    ).toLocaleDateString()
                })}
            </Text>
            {evacuationFile.lastLogDate ? (
                <Text style={[info, regularFont, textAlignLeft]}>
                    {translate('common.lastLogDate', {
                        date: new Date(
                            evacuationFile.lastLogDate
                        ).toLocaleDateString()
                    })}
                </Text>
            ) : (
                <View />
            )}
            {evacuationFile.logsNumber ? (
                <Text style={[mainColor, title, regularFont, textAlignLeft]}>
                    {translate('common.logs')}{' '}
                    <Text
                        style={[
                            mainColor,
                            subTitle,
                            regularFont,
                            textAlignLeft
                        ]}>
                        {translate('common.logsNumber', {
                            numLogs: evacuationFile.logsNumber
                        })}
                    </Text>
                </Text>
            ) : (
                <View />
            )}
        </View>
        <View
            style={[
                centerVertically,
                justifyAlignRightVertical,
                justifyCenter
            ]}>
            <MatButton onPress={syncEvac}>
                <View
                    style={[
                        STYLES.button,
                        evacuationFile.allSynced
                            ? STYLES.buttonFillConfirmed
                            : STYLES.buttonFill,
                        centerHorizontally,
                        justifyAlignRightHorizontal
                    ]}>
                    <Icon
                        name={evacuationFile.allSynced ? 'check' : 'sync'}
                        color="#fff"
                        size={20}
                    />
                    <Text style={[STYLES.buttonText, STYLES.buttonTextFill]}>
                        {translate(
                            `common.${
                                evacuationFile.allSynced ? 'synced' : 'sync'
                            }`
                        )}
                    </Text>
                </View>
            </MatButton>
            <MatButton onPress={editEvac}>
                <View
                    style={[
                        STYLES.button,
                        STYLES.buttonClear,
                        centerHorizontally,
                        justifyAlignRightHorizontal
                    ]}>
                    <Icon name="edit" color={MAIN_RED} size={20} />
                    <Text style={[STYLES.buttonText, STYLES.buttonTextClear]}>
                        {translate('common.editEvacuationFile')}
                    </Text>
                </View>
            </MatButton>
            <MatButton onPress={onAddLog}>
                <View
                    style={[
                        STYLES.button,
                        STYLES.buttonClear,
                        centerHorizontally,
                        justifyAlignRightHorizontal
                    ]}>
                    <Icon name="add" color={MAIN_RED} size={20} />
                    <Text style={[STYLES.buttonText, STYLES.buttonTextClear]}>
                        {translate('common.addLog')}
                    </Text>
                </View>
            </MatButton>
        </View>
    </View>
);

EvacuationCard.defaultProps = {
    editEvac: () => true,
    syncEvac: () => true
};

export default EvacuationCard;
