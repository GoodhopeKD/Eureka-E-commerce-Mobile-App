import React from 'react';

import { View, TouchableOpacity, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import RBSheet from "react-native-raw-bottom-sheet";
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const { height } = Dimensions.get('window');

const PickerOption = (props) => {
    const conditional = props.children ? {} : { justifyContent: 'center', height: 60, }
    return (
        <View style={{
            flex: 1,
            marginHorizontal: 20,
            ...conditional,
            ...props.style
        }}>
            {props.children ? props.children : <Text>{props.label}</Text>}
        </View>
    )
}

class BottomSheetPicker extends React.Component {

    onValueChange = (value) => {
        return value
    }

    render() {

        let botttom_sheet_height = this.props.title_label ? 80 : 25
        let options = {}

        const new_children = this.props.children ? this.props.children.map((child, index) => {
            if (child.type.name === PickerOption.name) {
                const extra_height = child.props.style && child.props.style.height ? child.props.style.height : 60
                botttom_sheet_height = botttom_sheet_height + extra_height
                options[child.props.value] = child.props.label
                return <TouchableOpacity key={index} onPress={() => { this.props.onValueChange(child.props.value, index); this.bottom_sheet_picker.close() }}>{child}</TouchableOpacity>
            }
        }) : null

        const max_height = height * 0.75

        botttom_sheet_height = (botttom_sheet_height > max_height) ? max_height : botttom_sheet_height

        return <>
            <TouchableOpacity testID='paymentBs' onPress={() => this.bottom_sheet_picker.open()} style={{ height: 55, alignItems: 'center', ...this.props.style, flex: 1, flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 16, ...this.props.selected_label_style }}>{options[this.props.selected_value]}</Text>
                <MaterialIcons name='arrow-drop-down' size={24} color={'#777'} />
            </TouchableOpacity>

            <RBSheet
                ref={ref => { this.bottom_sheet_picker = ref; }}
                height={botttom_sheet_height}
                openDuration={250}
                closeOnDragDown
                closeDuration={20}
                customStyles={{
                    container: {
                        borderTopRightRadius: 20,
                        borderTopLeftRadius: 20
                    }
                }}
            >
                {this.props.title_label && <>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', paddingBottom: 20, paddingTop: 10, textAlign: 'center' }}>{this.props.title_label}</Text>
                    <View style={{ borderBottomColor: '#ccc', borderBottomWidth: StyleSheet.hairlineWidth }} ></View>
                </>}
                <ScrollView>
                    {new_children}
                </ScrollView>
            </RBSheet>
        </>
    }
}

export { BottomSheetPicker, PickerOption }