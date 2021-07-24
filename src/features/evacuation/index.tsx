import * as React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import EvacuationListPage from './pages/evacuation-list-page.component';
import {EvacuationStackParamsTypes} from '../../core/types/evacuation-stack-params.types';
import miscUtils from '../../utils/misc.utils';

const PARC_PREP_STACK = createStackNavigator<EvacuationStackParamsTypes>();

const EvacuationStackScreens = () => (
    <PARC_PREP_STACK.Navigator
        screenOptions={{...miscUtils.stackHeaderOptions}}>
        <PARC_PREP_STACK.Screen
            name="evacuationList"
            component={EvacuationListPage}
        />
    </PARC_PREP_STACK.Navigator>
);

export default EvacuationStackScreens;
