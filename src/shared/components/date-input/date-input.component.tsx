import React, {useState} from 'react';
import {StyleSheet, Text, TouchableWithoutFeedback, View} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import RNDateTimePicker, {Event} from '@react-native-community/datetimepicker';
import CommonStyles, {
    poppinsRegular,
    widthPercentageToDP
} from '../../../styles';
import MatButton from '../mat-button.component';
import {convertToTimeOnly} from '../../../core/services/sync-tools.service';

const {
    fullViewWidthInside,
    centerHorizontally,
    spaceBetween,
    alignCenter,
    centerVertically,
    justifyAlignCenter,
    justifyAlignTopVertical,
    justifyAlignLeftVertical
} = CommonStyles;
const LINE_HEIGHT = 25;
const STYLES = StyleSheet.create({
    fieldContainer: {
        marginBottom: 16
    },
    disabledInput: {
        opacity: 0.5
    },
    textStyle: {
        fontFamily: poppinsRegular,
        lineHeight: LINE_HEIGHT,
        textAlign: 'left',
        color: '#000'
    },
    label: {
        maxWidth: widthPercentageToDP(31),
        width: widthPercentageToDP(31),
        fontSize: 14,
        opacity: 0.6,
        fontWeight: 'bold'
    },
    textInput: {
        height: LINE_HEIGHT + 8,
        maxWidth: widthPercentageToDP(92),
        width: widthPercentageToDP(92),
        borderBottomWidth: 1,
        borderBottomColor: '#707070',
        paddingRight: 5,
        fontSize: 16
    },
    iconButton: {
        width: LINE_HEIGHT - 4,
        height: LINE_HEIGHT - 4,
        borderRadius: (LINE_HEIGHT - 4) / 2
    }
});

const DateInput: React.FunctionComponent<{
    title: string;
    value: Date;
    mode?: 'date' | 'time';
    required?: boolean;
    onDateChange: (newDate: Date) => void;
}> = ({
    title,
    value,
    required,
    mode,
    onDateChange
}: {
    title: string;
    value: Date;
    mode?: 'date' | 'time';
    required?: boolean;
    onDateChange: (newDate: Date) => void;
}) => {
    const [showDatePicker, setShowDatePicker] = useState<boolean>(false);

    const showCalClockValue = (dateTime: Date): string => {
        if (dateTime) {
            if (mode === 'date') {
                return new Date(dateTime).toLocaleDateString();
            }
            return convertToTimeOnly(new Date(dateTime));
        }
        return '';
    };
    const onDateSelection = (event: Event, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) {
            onDateChange(selectedDate);
        }
    };

    return (
        <>
            <View
                style={[
                    fullViewWidthInside,
                    centerVertically,
                    justifyAlignTopVertical,
                    justifyAlignLeftVertical,
                    STYLES.fieldContainer
                ]}>
                <Text style={[STYLES.label, STYLES.textStyle]}>
                    {required ? `${title} *` : title}
                </Text>

                <TouchableWithoutFeedback
                    onPress={() => {
                        setShowDatePicker(true);
                    }}>
                    <View
                        style={[
                            STYLES.textInput,
                            centerHorizontally,
                            spaceBetween,
                            alignCenter
                        ]}>
                        <View>
                            <Text style={[STYLES.textStyle]}>
                                {showCalClockValue(value)}
                            </Text>
                        </View>

                        <MatButton isIcon disabled disabledOpacity={1}>
                            <View
                                style={[
                                    STYLES.iconButton,
                                    centerVertically,
                                    justifyAlignCenter
                                ]}>
                                <Icon
                                    name="today"
                                    size={LINE_HEIGHT - 4}
                                    color="#000"
                                />
                            </View>
                        </MatButton>
                    </View>
                </TouchableWithoutFeedback>
            </View>
            {showDatePicker && (
                <RNDateTimePicker
                    testID="dateTimePicker"
                    value={value}
                    mode={mode || 'date'}
                    onChange={onDateSelection}
                />
            )}
        </>
    );
};

DateInput.defaultProps = {
    required: false,
    mode: 'date'
};

export default DateInput;
