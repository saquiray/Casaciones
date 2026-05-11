import { useRouter } from 'expo-router';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
    const router = useRouter();
    const options = [
        {
            id: 1,
            title: 'Diario El Peruano',
            icon: require('../assets/ElPeruano.png'),
            origen: 'casaciones',
        },
        {
            id: 2,
            title: 'Opción 2',
            icon: require('../assets/ElPeruano.png'),
            origen: 'sentencias',
        },
        {
            id: 3,
            title: 'Opción 3',
            icon: '⚙️',
            origen: 'settings',
        },
    ];

    const handlePress = (option) => {

        router.push({
            pathname: "/Search",
            params: {
                origen: option.origen,
            },
        });

        console.log(
            `Seleccionado: ${option.origen}`
        );
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.container}>
                <Text style={styles.title}>Selecciona donde buscar</Text>
                <View style={styles.cardsContainer}>
                    {options.map((option) => (
                        <TouchableOpacity
                            key={option.id}
                            style={styles.card}
                            onPress={() => handlePress(option)}
                        >
                            <Image source={option.icon} style={styles.OptionImage} />
                            <Text style={styles.cardTitle}>{option.title}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    OptionImage: {
        width: 160,
        height: 40,
        marginBottom: 30,
        marginTop: 30,
    },
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        paddingHorizontal: 20,
        paddingVertical: 40,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 30,
        color: '#333',
    },
    cardsContainer: {
        gap: 15,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    icon: {
        fontSize: 40,
        marginBottom: 10,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
});