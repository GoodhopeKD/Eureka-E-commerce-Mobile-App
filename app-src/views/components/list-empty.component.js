import React from 'react';

import { View, Text, Image } from 'react-native';

const ListEmptyComponent = () => {
    const image = Image.resolveAssetSource(require('../../assets/general-img/empty-list.png'))
    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 20 }}>
            {<Image
                source={image}
                style={{
                    width: '100%',
                    height: undefined,
                    aspectRatio: image.width / image.height,
                    marginBottom: 20
                }}
                resizeMode="contain"
                resizeMethod="resize"
            />}
            <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Empty List!</Text>
            <Text style={{ fontSize: 18 }}>No items to show at the moment</Text>
        </View>
    );
}

export default ListEmptyComponent
