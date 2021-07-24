import {StackNavigationProp} from '@react-navigation/stack';
import {MainTabsNavigationProps} from './main-tabs-params.type';

type EvacuationStackNavigationProps = StackNavigationProp<
    MainTabsNavigationProps,
    'evacuationStack'
>;

export type EvacuationStackProps = {
    navigation: EvacuationStackNavigationProps;
};
