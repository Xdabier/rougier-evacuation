import {RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {CommonPropsType} from './common-props.type';
import {EvacuationStackParamsTypes} from './evacuation-stack-params.types';

type EvacuationScreenNavigationProps = StackNavigationProp<
    EvacuationStackParamsTypes,
    'evacuationList'
>;

type EvacuationScreenRouteProps = RouteProp<
    EvacuationStackParamsTypes,
    'evacuationList'
>;

export interface EvacuationScreenProps extends CommonPropsType {
    navigation: EvacuationScreenNavigationProps;
    route: EvacuationScreenRouteProps;
}
