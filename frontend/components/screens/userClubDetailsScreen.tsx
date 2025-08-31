import React from 'react';
import { StyleSheet, View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';    
const UserClubDetailsScreen = () => {
        const router = useRouter();
    return (
        <View style={styles.container}>
            <Text>User Club Details</Text>
            <Button title="Go Back" onPress={() => router.back()} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
})

export const headers = () => {
    return {
        headerShown: true,
        headerBackTitle: 'Back',
    }
};

export default UserClubDetailsScreen;
