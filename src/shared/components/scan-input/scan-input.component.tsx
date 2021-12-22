import React, {useState} from 'react';
import {
    KeyboardTypeOptions,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import CommonStyles, {
    MAIN_LIGHT_GREY,
    MAIN_RED,
    poppinsRegular,
    widthPercentageToDP
} from '../../../styles';
import MatButton from '../mat-button.component';

const {
    fullViewWidthInside,
    centerHorizontally,
    centerVertically,
    justifyAlignTopVertical,
    justifyAlignLeftVertical,
    spaceBetween,
    alignCenter,
    justifyAlignCenter
} = CommonStyles;
const LINE_HEIGHT = 25;
const STYLES = StyleSheet.create({
    errorContainer: {
        marginBottom: 16
    },
    errorSpacer: {
        maxWidth: widthPercentageToDP(27.669902912621357),
        width: widthPercentageToDP(27.669902912621357)
    },
    errorText: {
        color: MAIN_RED,
        fontSize: 13,
        fontFamily: poppinsRegular,
        maxWidth: widthPercentageToDP(90),
        width: widthPercentageToDP(90)
    },
    fieldContainer: {
        // marginBottom: 16
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
        maxWidth: widthPercentageToDP(80),
        width: widthPercentageToDP(80),
        fontSize: 14,
        opacity: 0.6,
        fontWeight: 'bold'
    },
    textInput: {
        padding: 0,
        maxWidth: '90%',
        width: '90%'
    },
    inputContainer: {
        height: LINE_HEIGHT + 8,
        borderBottomWidth: 1,
        borderBottomColor: '#707070',
        paddingRight: 5,
        fontSize: 16,
        maxWidth: widthPercentageToDP(92),
        width: widthPercentageToDP(92)
    },
    iconButton: {
        width: LINE_HEIGHT - 4,
        height: LINE_HEIGHT - 4,
        borderRadius: (LINE_HEIGHT - 4) / 2
    }
});

const ScanInput: React.FunctionComponent<{
    title: string;
    placeholder: string;
    errText?: string;
    defaultValue?: string;
    maxLength?: number;
    disabled?: boolean;
    required?: boolean;
    pattern?: string[];
    keyboardType?: KeyboardTypeOptions;
    value?: string | undefined | null;
    onChangeText?: (text: string) => void;
    onValidation?: (valids: boolean | boolean[]) => void;
    showCodeScanner?: () => void;
}> = ({
    title,
    placeholder,
    defaultValue,
    value,
    errText,
    onChangeText,
    disabled,
    required,
    pattern,
    maxLength,
    keyboardType,
    onValidation,
    showCodeScanner
}: {
    title: string;
    placeholder: string;
    defaultValue?: string;
    errText?: string;
    maxLength?: number;
    disabled?: boolean;
    required?: boolean;
    pattern?: string[];
    keyboardType?: KeyboardTypeOptions;
    value?: string | undefined | null;
    onChangeText?: (text: string) => void;
    onValidation?: (valids: boolean | boolean[]) => void;
    showCodeScanner?: () => void;
}) => {
    const [err, setErr] = useState<boolean | boolean[]>(false);
    const handleValidation = (text: string) => {
        if (!pattern || !pattern.length) return true;

        if (pattern.length === 1) {
            const condition = new RegExp(pattern[0], 'g');
            return condition.test(text);
        }
        const conditions = pattern.map((rule) => new RegExp(rule, 'g'));
        return conditions.map((condition) => condition.test(text));
    };

    const onChange = (_value: string) => {
        const isValid = handleValidation(_value);
        setErr(!isValid);
        if (onValidation) {
            onValidation(isValid);
        }
        if (onChangeText) {
            onChangeText(_value);
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
                <View
                    style={[
                        STYLES.inputContainer,
                        centerHorizontally,
                        spaceBetween,
                        alignCenter
                    ]}>
                    <TextInput
                        autoCapitalize="none"
                        maxLength={maxLength}
                        keyboardType={keyboardType || 'default'}
                        onChangeText={(text: string) => onChange(text)}
                        value={value || ''}
                        editable={disabled !== undefined ? !disabled : true}
                        defaultValue={defaultValue || ''}
                        style={[
                            STYLES.textInput,
                            STYLES.textStyle,
                            disabled ? STYLES.disabledInput : {}
                        ]}
                        placeholderTextColor={MAIN_LIGHT_GREY}
                        placeholder={placeholder}
                    />
                    <MatButton isIcon onPress={showCodeScanner}>
                        <View
                            style={[
                                STYLES.iconButton,
                                centerVertically,
                                justifyAlignCenter
                            ]}>
                            <Icon
                                name="qr-code-scanner"
                                size={LINE_HEIGHT - 4}
                                color="#000"
                            />
                        </View>
                    </MatButton>
                </View>
            </View>
            {err ? (
                <View
                    style={[
                        STYLES.errorContainer,
                        centerHorizontally,
                        spaceBetween
                    ]}>
                    <Text style={[STYLES.errorText]}>{errText}</Text>
                </View>
            ) : (
                <View style={[STYLES.errorContainer]} />
            )}
        </>
    );
};

ScanInput.defaultProps = {
    defaultValue: '',
    value: '',
    errText: '',
    keyboardType: 'default',
    disabled: false,
    required: false,
    maxLength: 60,
    pattern: [],
    onValidation: () => {},
    onChangeText: () => {},
    showCodeScanner: () => {}
};

export default ScanInput;
