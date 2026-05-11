import * as FileSystem from 'expo-file-system/legacy';
import { router, useLocalSearchParams } from "expo-router";
import * as Sharing from 'expo-sharing';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { searchDocuments } from '../src/api/searchApi';

interface Document {
    id: string;
    name: string;
    image: string;
    date: string;
    url: string;
    pagina?: number;
}

export default function Search() {
    const { origen } = useLocalSearchParams() ;
    
    const [searchText, setSearchText] = useState('');

    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(false);

    const today = new Date();

    const currentMonth = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
    ][today.getMonth()];

    const currentYear = today.getFullYear().toString();

    const [selectedMonth, setSelectedMonth] = useState(currentMonth);
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const months = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
    ];

    // 🔥 Fetch desde tu backend
    const fetchDocuments = async () => {
        try {
            setLoading(true);

            const data = await searchDocuments({
                origen: origen[0],
                query: debouncedText,
                month: selectedMonth,
                year: selectedYear,
            });

            // ✅ AQUÍ ESTÁ EL FIX
            const mapped = (data.results || []).map((doc: any, index: number) => {

                // 🔥 extraer fecha del título
                const match = doc.titulo.match(/CA(\d{4})(\d{2})(\d{2})/);

                const year = match ? match[1] : '2026';
                const month = match ? match[2] : '01';
                const day = match ? match[3] : '01';

                return {
                    id: doc.id || index.toString(),
                    name: doc.titulo,

                    image: `https://elperuano.pe/NormasElperuano/PortadaFull/${year}/${month}/${day}/_CA${year}${month}${day}_Portada.jpg`,

                    date: `${day}/${month}/${year}` || 'N/A',

                    url: doc.url_pdf,

                    pagina: doc.pagina, // 🔥 IMPORTANTE
                };
            });
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
        }, 600); // ⏱️ 600ms

        return () => clearTimeout(timeout);
    }, [searchText]);

    // 🔁 Se ejecuta cuando cambian filtros o búsqueda
    useEffect(() => {
        if (debouncedText.trim() === '' && !selectedMonth && !selectedYear) {
            setDocuments([]);
            return;
        }
        else {
            fetchDocuments();
        }
    }, [debouncedText, selectedMonth, selectedYear]);

    const sharePDF = async (url: string, filename: string) => {
        try {
            const fileUri = FileSystem.documentDirectory + filename;

            const { uri } = await FileSystem.downloadAsync(url, fileUri);

            console.log("Descargado en:", uri);

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(uri);
            }

        } catch (error) {
            console.log("Error descargando PDF:", error);
        }
    };
    const downloadPDF = async (url: string, filename: string) => {
        try {
            const fileUri = FileSystem.documentDirectory + filename;

            const { uri } = await FileSystem.downloadAsync(url, fileUri);

            console.log("Guardado en:", uri);

            // opcional: feedback visual
            alert("PDF descargado correctamente");

        } catch (error) {
            console.log("Error descargando PDF:", error);
        }
    };
    const renderDocument = ({ item }: { item: Document }) => (
        <View style={styles.documentCard}>

            <Image source={{ uri: item.image }} style={styles.documentImage} />

            <Text style={styles.documentName} numberOfLines={2}>
                {item.name}
            </Text>

            <Text style={styles.documentDate}>{item.date}</Text>

            {/* 🔘 BOTONES */}
            <View style={styles.actionsContainer}>

                {/* 👁️ VER */}
                <TouchableOpacity
                    style={[styles.actionButton, styles.viewButton]}
                    onPress={() =>
                        router.push({
                            pathname: "/PdfScreen",
                            params: {
                                url: item.url,
                                query: debouncedText,
                                pagina: item.pagina,
                            },
                        })
                    }
                >
                    <Text style={styles.actionText}>Ver</Text>
                </TouchableOpacity>

                {/* ⬇️ DESCARGAR */}
                <TouchableOpacity
                    style={[styles.actionButton, styles.downloadButton]}
                    onPress={() =>
                        sharePDF(
                            `http://143.244.163.112:3000${item.url}`,
                            item.name
                        )
                    }
                >
                    <Text style={styles.actionText}>Descargar</Text>
                </TouchableOpacity>

            </View>
        </View>
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

            {/* 📅 FILTROS */}
            <View style={styles.filtersRow}>

                {/* MES */}
                <View style={styles.filterContainer}>
                    <Text style={styles.filterTitle}>Mes</Text>

                    <FlatList
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        data={months}
                        keyExtractor={(item) => item}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[
                                    styles.filterChip,
                                    selectedMonth === item && styles.filterChipActive
                                ]}
                                onPress={() =>
                                    setSelectedMonth(
                                        selectedMonth === item ? '' : item
                                    )
                                }
                            >
                                <Text
                                    style={[
                                        styles.filterChipText,
                                        selectedMonth === item &&
                                        styles.filterChipTextActive
                                    ]}
                                >
                                    {item}
                                </Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>

                {/* AÑO */}
                <View style={styles.filterContainer}>
                    <Text style={styles.filterTitle}>Año</Text>

                    <FlatList
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        data={[
                            '2026',
                            '2025',
                            '2024',
                            '2023',
                            '2022',
                            '2021',
                            '2020',
                            '2019',
                            '2018',
                            '2017',
                            '2016',
                            '2015',
                            '2014',
                            '2013',
                        ]}
                        keyExtractor={(item) => item}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[
                                    styles.filterChip,
                                    selectedYear === item && styles.filterChipActive
                                ]}
                                onPress={() =>
                                    setSelectedYear(
                                        selectedYear === item ? '' : item
                                    )
                                }
                            >
                                <Text
                                    style={[
                                        styles.filterChipText,
                                        selectedYear === item &&
                                        styles.filterChipTextActive
                                    ]}
                                >
                                    {item}
                                </Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            </View>

            {/* �📊 Resultados */}
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
    filtersRow: {
        marginBottom: 10,
    },

    filterContainer: {
        marginBottom: 10,
    },

    filterTitle: {
        marginLeft: 15,
        marginBottom: 8,
        fontSize: 14,
        fontWeight: '600',
    },

    filterChip: {
        marginLeft: 15,
        paddingHorizontal: 14,
        paddingVertical: 8,
        backgroundColor: '#fff',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#ddd',
    },

    filterChipActive: {
        backgroundColor: '#007AFF',
        borderColor: '#007AFF',
    },

    filterChipText: {
        color: '#333',
        fontSize: 13,
    },

    filterChipTextActive: {
        color: '#fff',
        fontWeight: '600',
    },
    actionsContainer: {
        flexDirection: 'row',
        marginTop: 10,
        gap: 10,
    },

    actionButton: {
        flex: 1,
        paddingVertical: 8,
        borderRadius: 6,
        alignItems: 'center',
    },

    viewButton: {
        backgroundColor: '#007AFF',
    },

    downloadButton: {
        backgroundColor: '#28a745',
    },

    actionText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 12,
    },
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