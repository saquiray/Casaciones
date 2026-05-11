import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import { searchDocuments } from '../api/searchApi';

interface Document {
    id: string;
    name: string;
    image: string;
    date: string;
}

export default function Search() {
    const [searchText, setSearchText] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('');
    const [selectedYear, setSelectedYear] = useState('');
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(false);

    const months = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
    ];

    // 🔥 Fetch desde tu backend
    const fetchDocuments = async () => {
        try {
            setLoading(true);

            const data = await searchDocuments({
                query: searchText
            });

            // 🔥 Mapear respuesta de OpenSearch
            const mapped = data.hits.hits.map((doc: any, index: number) => ({
                id: doc.id,
                name: doc._source.titulo,
                image: 'https://via.placeholder.com/80?text=PDF',
                date: doc._source.fecha || 'N/A',
            }));

            setDocuments(mapped);

        } catch (err) {
            console.log("Error:", err);
        } finally {
            setLoading(false);
        }
    };
    const [debouncedText, setDebouncedText] = useState(searchText);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setDebouncedText(searchText);
        }, 400); // ⏱️ 400ms

        return () => clearTimeout(timeout);
    }, [searchText]);

    // 🔁 Se ejecuta cuando cambian filtros o búsqueda
    useEffect(() => {
        fetchDocuments();
    }, [debouncedText, selectedMonth, selectedYear]);

    const renderDocument = ({ item }: { item: Document }) => (
        <TouchableOpacity style={styles.documentCard}>
            <Image source={{ uri: item.image }} style={styles.documentImage} />
            <Text style={styles.documentName} numberOfLines={2}>
                {item.name}
            </Text>
            <Text style={styles.documentDate}>{item.date}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* 🔍 Search */}
            <TextInput
                style={styles.searchInput}
                placeholder="Buscar documentos..."
                value={searchText}
                onChangeText={setSearchText}
            />

            {/* 🎛️ Filters */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.filtersContainer}
            >
                {/* Mes */}
                <View style={styles.filterGroup}>
                    <Text style={styles.filterLabel}>Mes:</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {months.map((month) => (
                            <TouchableOpacity
                                key={month}
                                style={[
                                    styles.filterButton,
                                    selectedMonth === month && styles.filterButtonActive,
                                ]}
                                onPress={() =>
                                    setSelectedMonth(selectedMonth === month ? '' : month)
                                }
                            >
                                <Text
                                    style={[
                                        styles.filterButtonText,
                                        selectedMonth === month && styles.filterButtonTextActive,
                                    ]}
                                >
                                    {month}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Año */}
                <View style={styles.filterGroup}>
                    <Text style={styles.filterLabel}>Año:</Text>
                    {[2026, 2025, 2024, 2023, 2022, 2021].map((year) => (
                        <TouchableOpacity
                            key={year}
                            style={[
                                styles.filterButton,
                                selectedYear === year.toString() && styles.filterButtonActive,
                            ]}
                            onPress={() =>
                                setSelectedYear(
                                    selectedYear === year.toString()
                                        ? ''
                                        : year.toString()
                                )
                            }
                        >
                            <Text
                                style={[
                                    styles.filterButtonText,
                                    selectedYear === year.toString() &&
                                    styles.filterButtonTextActive,
                                ]}
                            >
                                {year}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            {/* 📊 Resultados */}
            <Text style={styles.resultsLabel}>
                Resultados ({documents.length})
            </Text>

            {loading ? (
                <ActivityIndicator size="large" />
            ) : (
                <FlatList
                    data={documents}
                    renderItem={renderDocument}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.resultsContainer}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        paddingTop: 10,
    },
    searchInput: {
        marginHorizontal: 15,
        marginBottom: 15,
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    filtersContainer: {
        marginHorizontal: 15,
        marginBottom: 15,
    },
    filterGroup: {
        marginRight: 15,
    },
    filterLabel: {
        fontWeight: '600',
        marginBottom: 8,
        fontSize: 14,
    },
    filterButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: '#fff',
        borderRadius: 20,
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    filterButtonActive: {
        backgroundColor: '#007AFF',
        borderColor: '#007AFF',
    },
    filterButtonText: {
        fontSize: 12,
        color: '#333',
    },
    filterButtonTextActive: {
        color: '#fff',
    },
    resultsLabel: {
        marginHorizontal: 15,
        marginBottom: 10,
        fontWeight: '600',
        fontSize: 14,
    },
    resultsContainer: {
        paddingBottom: 20,
        paddingHorizontal: 15,
    },
    documentCard: {
        backgroundColor: '#fff',
        borderRadius: 8,
        marginBottom: 12,
        alignItems: 'center',
        padding: 10,
    },
    documentImage: {
        width: 60,
        height: 80,
        resizeMode: 'contain',
        marginBottom: 8,
    },
    documentName: {
        fontSize: 12,
        fontWeight: '500',
        textAlign: 'center',
        marginBottom: 4,
    },
    documentDate: {
        fontSize: 10,
        color: '#999',
    },
});