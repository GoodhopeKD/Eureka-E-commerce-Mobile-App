import React from 'react';
import { connect } from 'react-redux';

import { Snackbar } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { hideSnackbar } from '../../controller/actions/flash-message.actions';
import { navigationRef } from "../../controller/utils/navigation-ref";

const FlashSnackbar = (props) => {
        
    const state = navigationRef.current?.getState()
    const has_tabs = state && state.index == 0
    const insets = useSafeAreaInsets();
    const offset = isNumeric(insets.bottom) ? insets.bottom : 0
    const bottom = (has_tabs) ? 55 + offset : 10 + offset

    return (
        <Snackbar
            style={{ position: 'absolute', bottom, borderRadius: 10 }}
            visible={props.flash.visible}
            duration={props.flash.duration}
            onDismiss={props.hideSnackbar}
        >
            {props.flash.message}
        </Snackbar>
    )
}

const mapStateToProps = (state) => {
    return {
        flash: state.system_status_data.flash
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        hideSnackbar: () => dispatch(hideSnackbar()),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(FlashSnackbar);