import React, {useEffect, useState} from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {NavigationContainer} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {Dimensions, Keyboard, KeyboardEvent, Text, View} from 'react-native';
import {subscribe as eventSub} from 'pubsub-js';
import Spinner from 'react-native-loading-spinner-overlay';
import HomeStackScreens from './src/features/home';
import LogsStackScreens from './src/features/logs';
import EvacuationStackScreens from './src/features/evacuation';
import SettingsStackScreens from './src/features/settings';
import {MainTabsNavigationProps} from './src/core/types/main-tabs-params.type';
import {setI18nConfig, translate} from './src/utils/i18n.utils';
import BarIconNameEnum from './src/core/enum/bar-icon-name.enum';
import BarLabelNameEnum from './src/core/enum/bar-label-name.enum';
import {
    MAIN_GREY,
    MAIN_RED,
    poppinsRegular,
    TAB_BAR_BUTTON_HEIGHT,
    TAB_BAR_HEIGHT,
    TAB_BAR_VERT_PADDING
} from './src/styles';
import syncStorage from './src/core/services/sync-storage.service';
import {CuberInterface} from './src/core/interfaces/cuber.interface';
import {SiteInterface} from './src/core/interfaces/site.interface';
import {GasolineInterface} from './src/core/interfaces/gasoline.interface';
import {LogDetailsInterface} from './src/core/interfaces/log.interface';
import {UserInterface} from './src/core/interfaces/user.interface';
import {DefEvacInterface} from './src/core/interfaces/def-evac.interface';
import {MainStateContextInterface} from './src/core/interfaces/main-state.interface';
import MainStateContext from './src/core/contexts/main-state.context';
import {getDefaultEvacId} from './src/core/services/def-evac.service';
import {
    getEvacuationFileById,
    getEvacuationFiles,
    getEvacuationFilesIds
} from './src/core/services/evacuation.service';
import {getAux} from './src/core/services/aux-data.service';
import NameToTableEnum from './src/core/enum/name-to-table.enum';
import {EvacuationAllDetailsInterface} from './src/core/interfaces/evacuation-all-details.interface';
import {getLogs} from './src/core/services/logs.service';
import EventTopicEnum from './src/core/enum/event-topic.enum';
import {ServerInterface} from './src/core/interfaces/server.interface';
import {getServerData} from './src/core/services/server-data.service';

const TAB = createBottomTabNavigator<MainTabsNavigationProps>();

const App = () => {
    const loadStorage = async () => syncStorage.init();
    const [isReady, setIsReady] = useState<boolean>(false);
    const [isSpinning, setIsSpinning] = useState<boolean>(false);

    loadStorage()
        .then(() => {
            setI18nConfig();
            setIsReady(true);
        })
        .catch(() => {
            setI18nConfig();
            setIsReady(true);
        });

    const [cubers, setCubers] = useState<CuberInterface[]>([]);
    const [sites, setSites] = useState<SiteInterface[]>([]);
    const [gasolines, setGasolines] = useState<GasolineInterface[]>([]);
    const [logs, setLogs] = useState<LogDetailsInterface[]>([]);
    const [evacIds, setEvacIds] = useState<string[]>([]);
    const [serverData, setServerData] = useState<ServerInterface>();
    const [filteringId, setFilteringId] = useState<string>();
    const [evacuationFiles, setEvacuations] = useState<
        EvacuationAllDetailsInterface[]
    >([]);
    const [
        homeEvacuationFile,
        setHomeEvacuation
    ] = useState<EvacuationAllDetailsInterface | null>(null);
    const [user, setUser] = useState<UserInterface>();
    const [defaultEvac, setDefEvac] = useState<DefEvacInterface>({
        evacId: '',
        id: -1
    });
    const [keyboardHeight, setKeyboardHeight] = useState(0);

    const onKeyboardDidShow = (e: KeyboardEvent) => {
        const spacerHeight =
            Dimensions.get('window').height - e.endCoordinates.height;
        setKeyboardHeight(spacerHeight);
    };

    const onKeyboardDidHide = () => {
        setKeyboardHeight(0);
    };

    const MAIN_CONTEXT: MainStateContextInterface = {
        keyboardHeight,
        cubers,
        defaultEvac,
        gasolines,
        logs,
        evacuationFiles,
        sites,
        user,
        evacIds,
        homeEvacuationFile,
        filteringId,
        serverData,
        setServerData: (v: ServerInterface) => {
            setServerData(v);
        },
        setHomeEvacuationFile: (v: EvacuationAllDetailsInterface) => {
            setHomeEvacuation(v);
        },
        setFilteringId: (v: string) => {
            setFilteringId(v);
        },
        setUser: (v: UserInterface) => {
            setUser(v);
        },
        setDefaultEvac: (v: DefEvacInterface) => {
            setDefEvac(v);
        },
        setCubers: (v: CuberInterface | CuberInterface[]) => {
            if (Array.isArray(v)) {
                setCubers(v);
            } else {
                setCubers([...cubers, v]);
            }
        },
        setGasoline: (v: GasolineInterface | GasolineInterface[]) => {
            if (Array.isArray(v)) {
                setGasolines(v);
            } else {
                setGasolines([...gasolines, v]);
            }
        },
        setEvacIds: (v: string | string[]) => {
            if (Array.isArray(v)) {
                setEvacIds(v);
            } else {
                setEvacIds([...evacIds, v]);
            }
        },
        setSites: (v: SiteInterface | SiteInterface[]) => {
            if (Array.isArray(v)) {
                setSites(v);
            } else {
                setSites([...sites, v]);
            }
        },
        setLogs: (v: LogDetailsInterface | LogDetailsInterface[]) => {
            if (Array.isArray(v)) {
                setLogs(v);
            } else {
                setLogs([...logs, v]);
            }
        },
        setEvacuationFiles: (
            v: EvacuationAllDetailsInterface | EvacuationAllDetailsInterface[]
        ) => {
            if (Array.isArray(v)) {
                setEvacuations(v);
            } else {
                setEvacuations([...evacuationFiles, v]);
            }
        }
    };

    const refreshDefault = () => {
        getDefaultEvacId().then((value: DefEvacInterface[]) => {
            if (value && value.length) {
                setDefEvac(value[0]);
                setFilteringId(`${value[0].evacId}`);
                getEvacuationFileById(value[0].evacId).then((value1) => {
                    if (value1) {
                        if (value1.length) {
                            setHomeEvacuation(value1[0]);
                            getLogs(value[0].evacId).then(
                                (value2: LogDetailsInterface[]) => {
                                    setLogs(value2);

                                    getServerData().then(
                                        (value3: ServerInterface[]) => {
                                            if (value3 && value3.length) {
                                                setServerData(value3[0]);
                                            }
                                        }
                                    );
                                }
                            );
                        } else {
                            setHomeEvacuation(null);
                        }
                    } else {
                        setHomeEvacuation(null);
                    }
                });
            }
        });
    };

    const refreshServerData = () => {
        getServerData().then((value: ServerInterface[]) => {
            if (value && value.length) {
                setServerData(value[0]);
            }
        });
    };

    const refreshAllEvacFiles = () => {
        getEvacuationFiles().then((value: EvacuationAllDetailsInterface[]) => {
            if (value && value.length) {
                setEvacuations(value);
                getEvacuationFilesIds().then((value1: string[]) => {
                    setEvacIds(value1);
                });
            }
        });
    };

    const refreshAux = () => {
        getAux(NameToTableEnum.gasoline).then((value) => {
            if (value && value.length) {
                setGasolines(value);
                getAux(NameToTableEnum.site).then((value1) => {
                    if (value1 && value1.length) {
                        setSites(value1);
                        getAux(NameToTableEnum.cuber).then((value2) => {
                            if (value2 && value2.length) {
                                setCubers(value2);
                            }
                        });
                    }
                });
            }
        });
    };

    useEffect(() => {
        refreshDefault();
        refreshAux();
        refreshAllEvacFiles();
        refreshServerData();

        eventSub(EventTopicEnum.updateEvacuation, () => {
            refreshAllEvacFiles();
            refreshDefault();
        });

        eventSub(
            EventTopicEnum.setSpinner,
            (name: string, spinning: boolean) => {
                setIsSpinning(spinning);
            }
        );

        eventSub(EventTopicEnum.updateAux, () => {
            refreshAux();
        });

        eventSub(EventTopicEnum.updateServer, () => {
            refreshServerData();
        });

        Keyboard.addListener('keyboardDidShow', onKeyboardDidShow);
        Keyboard.addListener('keyboardDidHide', onKeyboardDidHide);

        return (): void => {
            Keyboard.removeListener('keyboardDidShow', onKeyboardDidShow);
            Keyboard.removeListener('keyboardDidHide', onKeyboardDidHide);
        };
    }, []);

    return isReady ? (
        <>
            <Spinner
                visible={isSpinning}
                animation="fade"
                textStyle={{
                    color: '#FFF'
                }}
                overlayColor="rgba(0, 0, 0, 0.7)"
                textContent={translate('common.syncing')}
            />
            <MainStateContext.Provider value={MAIN_CONTEXT}>
                <NavigationContainer>
                    <TAB.Navigator
                        initialRouteName="homeStack"
                        tabBarOptions={{
                            style: {
                                height: TAB_BAR_HEIGHT,
                                paddingVertical: TAB_BAR_VERT_PADDING
                            },
                            activeTintColor: MAIN_RED,
                            inactiveTintColor: MAIN_GREY,
                            labelStyle: {
                                fontFamily: poppinsRegular,
                                fontSize: 12
                            },
                            tabStyle: {
                                height: TAB_BAR_BUTTON_HEIGHT
                            }
                        }}
                        screenOptions={({route}) => ({
                            tabBarIcon: ({
                                size,
                                focused
                            }: {
                                focused: boolean;
                                size: number;
                            }) => {
                                const COLOR = focused ? MAIN_RED : MAIN_GREY;
                                const NAME = BarIconNameEnum[route.name];
                                return (
                                    <Icon
                                        name={NAME}
                                        size={size}
                                        color={COLOR}
                                    />
                                );
                            },
                            tabBarLabel: translate(BarLabelNameEnum[route.name])
                        })}>
                        <TAB.Screen
                            name="evacuationStack"
                            component={EvacuationStackScreens}
                        />
                        <TAB.Screen
                            name="logsStack"
                            component={LogsStackScreens}
                        />
                        <TAB.Screen
                            name="homeStack"
                            component={HomeStackScreens}
                        />
                        <TAB.Screen
                            name="settingsStack"
                            component={SettingsStackScreens}
                        />
                    </TAB.Navigator>
                </NavigationContainer>
            </MainStateContext.Provider>
        </>
    ) : (
        <View>
            <Text>Loading...</Text>
        </View>
    );
};

export default App;
