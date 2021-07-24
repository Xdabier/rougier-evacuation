import React from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {Dimensions, StyleSheet, Text, View} from 'react-native';
import CommonStyles, {
    BORDER_RADIUS,
    MAIN_RED,
    PADDING_HORIZONTAL,
    poppinsRegular
} from '../../../styles';
import {translate} from '../../../utils/i18n.utils';
import MatButton from '../mat-button.component';
import {LogDetailsInterface} from '../../../core/interfaces/log.interface';

const {
    fullWidth,
    mainColor,
    centerHorizontally,
    centerVertically,
    spaceBetween,
    alignCenter,
    rougierShadow,
    regularFont,
    textAlignLeft,
    justifyAlignLeftVertical,
    justifyAlignRightHorizontal,
    justifyCenter,
    info,
    title,
    subTitle
} = CommonStyles;
const STYLES = StyleSheet.create({
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
    buttonClear: {
        backgroundColor: '#fff'
    },
    buttonText: {
        lineHeight: 20,
        fontFamily: poppinsRegular,
        fontSize: 13,
        marginLeft: 6
    },
    buttonTextClear: {
        color: MAIN_RED
    }
});

const LogCard: React.FunctionComponent<{
    logItem: LogDetailsInterface;
    editLog?: () => void;
}> = ({
    logItem,
    editLog
}: {
    logItem: LogDetailsInterface;
    editLog?: () => void;
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
            style={[centerVertically, justifyAlignLeftVertical, justifyCenter]}>
            <Text style={[mainColor, title, regularFont, textAlignLeft]}>
                {translate('common.logId')}{' '}
                <Text style={[mainColor, subTitle, regularFont, textAlignLeft]}>
                    {logItem.id}
                </Text>
            </Text>
            <Text style={[info, regularFont, textAlignLeft]}>
                {translate('common.evacFileId', {
                    fileId: logItem.evacuationId
                })}
            </Text>
            <Text style={[info, regularFont, textAlignLeft]}>
                {`${translate('modals.logs.fields.diameterAvg.label')}: ${
                    logItem.diameter
                }`}
            </Text>
            <Text style={[info, regularFont, textAlignLeft]}>
                {`${translate('modals.logs.fields.volume.label')}: ${
                    logItem.volume
                }`}
            </Text>
            <Text style={[info, regularFont, textAlignLeft]}>
                {`${translate('modals.logs.fields.quality.label')}: ${
                    logItem.quality
                }`}
            </Text>
            {!!logItem.status && (
                <Text style={[info, regularFont, textAlignLeft]}>
                    {`${translate('modals.logs.fields.status.label')}: ${
                        logItem.status
                    }`}
                </Text>
            )}
            <Text style={[info, regularFont, textAlignLeft]}>
                {`${translate('modals.logs.fields.gasoline.label')}: ${
                    logItem.gasName
                }`}
            </Text>
            <Text style={[info, regularFont, textAlignLeft]}>
                {translate('common.creationDate', {
                    date: new Date(logItem.creationDate).toLocaleDateString()
                })}
            </Text>
            <View
                style={[
                    centerHorizontally,
                    justifyAlignRightHorizontal,
                    fullWidth
                ]}>
                <MatButton onPress={editLog}>
                    <View
                        style={[
                            STYLES.button,
                            STYLES.buttonClear,
                            centerHorizontally,
                            justifyAlignRightHorizontal
                        ]}>
                        <Icon name="edit" color={MAIN_RED} size={20} />
                        <Text
                            style={[STYLES.buttonText, STYLES.buttonTextClear]}>
                            {translate('common.editLog')}
                        </Text>
                    </View>
                </MatButton>
            </View>
        </View>
    </View>
);

LogCard.defaultProps = {
    editLog: () => true
};

export default LogCard;
