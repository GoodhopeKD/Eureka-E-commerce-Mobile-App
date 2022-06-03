import React from 'react';

import { ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';

export default class CustomKeyboardAvoidingView extends React.Component {
    render() {
        return <SafeAreaInsetsContext.Consumer>
            {insets => <KeyboardAvoidingView keyboardVerticalOffset={Platform.OS === 'ios' ? (55 + Math.max(insets.bottom, 10)) : 0} behavior={Platform.OS === 'ios' ? "padding" : null} style={{ flex: 1 }}>
                {this.props.scrollview === false ? this.props.children :
                    <ScrollView showsVerticalScrollIndicator={false} style={{ ...this.props.style, flex: 1 }}>
                        {this.props.children}
                    </ScrollView>
                }
            </KeyboardAvoidingView>}
        </SafeAreaInsetsContext.Consumer>
    }
}