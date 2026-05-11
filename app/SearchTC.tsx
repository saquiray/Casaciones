import * as FileSystem from "expo-file-system/legacy";
import { router } from "expo-router";
import * as Sharing from "expo-sharing";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { searchDocuments } from "../src/api/searchApi";
import { TESAURO_DATA } from "../src/data/tesauroData";

interface Document {
  id: string;
  name: string;
  date: string;
  url?: string | null;
  pagina?: number | null;
  fuente?: string | null;
  tipo_documento?: string | null;
  tesaurio_nombre?: string | null;
  tesaurio_slug?: string | null;
  nombre_archivo?: string | null;
}

interface FilterOption {
  label: string;
  value: string;
}

interface TesaurioNode {
  id: number;
  nombre: string;
  slug: string;
  code: string;
  count: number;
  children?: TesaurioNode[];
}

export default function Search() {
  const [searchText, setSearchText] = useState("");
  const [debouncedText, setDebouncedText] = useState(searchText);

  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);

  const today = new Date();

  const months = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  const years = [
    "2026",
    "2025",
    "2024",
    "2023",
    "2022",
    "2021",
    "2020",
    "2019",
    "2018",
    "2017",
    "2016",
    "2015",
    "2014",
    "2013",
  ];
  const getLastAvailableTesaurioLevel = () => {
    const levels = getTesaurioLevelsToRender();
    return levels[levels.length - 1];
  };

  const isLastTesaurioLevelSelected = () => {
    const lastLevel = getLastAvailableTesaurioLevel();

    // Si no hay niveles, no hay nada seleccionado
    if (lastLevel === undefined) return false;

    // Si el último nivel visible tiene una opción seleccionada
    return !!getSelectedValueForLevel(lastLevel);
  };

  const shouldAskForLastFilter = () => {
    // Solo pedir esto si todavía no hay resultados y no está cargando
    if (loading) return false;

    // Si no ha seleccionado nada del tesauro
    if (!isLastTesaurioLevelSelected()) return true;

    return false;
  };
  const currentMonth = months[today.getMonth()];
  const currentYear = today.getFullYear().toString();

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const [selectedTipoDocumento, setSelectedTipoDocumento] = useState("");
  const [selectedFuente, setSelectedFuente] = useState("");

  /**
   * Ruta seleccionada del tesauro.
   * Ejemplo:
   * [
   *   Derechos fundamentales,
   *   Derechos de primera generación,
   *   Derechos individuales
   * ]
   */
  const [selectedTesaurioPath, setSelectedTesaurioPath] = useState<
    TesaurioNode[]
  >([]);

  const selectedTesaurioSlug = useMemo(() => {
    if (selectedTesaurioPath.length === 0) return "";
    return selectedTesaurioPath[selectedTesaurioPath.length - 1].slug;
  }, [selectedTesaurioPath]);

  const tiposDocumento: FilterOption[] = [
    { label: "Todos", value: "" },
    { label: "Sentencia", value: "Sentencia" },
    { label: "Auto", value: "Auto" },
    { label: "Resolución", value: "Resolución" },
    { label: "Casación", value: "Casación" },
  ];

  const fuentes: FilterOption[] = [
    { label: "Todas", value: "" },
    { label: "Poder Judicial", value: "Poder Judicial" },
    { label: "Corte Suprema", value: "Corte Suprema" },
    { label: "El Peruano", value: "El Peruano" },
    { label: "Tribunal Constitucional", value: "Tribunal Constitucional" },
  ];

  const formatDate = (dateValue?: string | null) => {
    if (!dateValue) return "N/A";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "N/A";
    }

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  };

  const stripHtml = (value?: string | null) => {
    if (!value) return "";
    return value.replace(/<[^>]*>/g, "");
  };

  const getHighlightText = (highlight: any) => {
    if (!highlight) return null;

    if (highlight.titulo?.length) {
      return stripHtml(highlight.titulo[0]);
    }

    if (highlight.contenido?.length) {
      return stripHtml(highlight.contenido[0]);
    }

    if (highlight.nombre_archivo?.length) {
      return stripHtml(highlight.nombre_archivo[0]);
    }

    if (highlight.tesaurio_nombre?.length) {
      return stripHtml(highlight.tesaurio_nombre[0]);
    }

    return null;
  };

  const toFilterOptions = (nodes: TesaurioNode[]): FilterOption[] => {
    return [
      ...nodes.map((node) => ({
        label: `${node.nombre} (${node.count})`,
        value: node.slug,
      })),
    ];
  };

  const getNodesForLevel = (level: number): TesaurioNode[] => {
    if (level === 0) {
      return TESAURO_DATA as TesaurioNode[];
    }

    const parent = selectedTesaurioPath[level - 1];

    if (!parent?.children?.length) {
      return [];
    }

    return parent.children;
  };

  const handleSelectTesaurioLevel = (level: number, slug: string) => {
    if (!slug) {
      setSelectedTesaurioPath((prev) => prev.slice(0, level));
      return;
    }

    const nodes = getNodesForLevel(level);
    const selectedNode = nodes.find((node) => node.slug === slug);

    if (!selectedNode) return;

    setSelectedTesaurioPath((prev) => {
      const newPath = prev.slice(0, level);
      newPath[level] = selectedNode;
      return newPath;
    });
  };

  const getSelectedValueForLevel = (level: number) => {
    return selectedTesaurioPath[level]?.slug || "";
  };

  const getTesaurioLevelsToRender = () => {
    const levels: number[] = [0];

    selectedTesaurioPath.forEach((node, index) => {
      if (node.children?.length) {
        levels.push(index + 1);
      }
    });

    return levels;
  };

  const getTesaurioLevelTitle = (level: number) => {
    if (level === 0) return "Materia";
    if (level === 1) return "Submateria";
    if (level === 2) return "Tema";
    if (level === 3) return "Subtema";
    return `Nivel ${level + 1}`;
  };

  const fetchDocuments = async () => {
    try {
      setLoading(true);

      const data = await searchDocuments({
        origen: "sentencias",
        query: debouncedText,
        month: selectedMonth,
        year: selectedYear,
        tipoDocumento: selectedTipoDocumento,
        tesaurioSlug: selectedTesaurioSlug,
        fuente: selectedFuente,
      });

      const mapped: Document[] = (data.results || []).map(
        (doc: any, index: number) => {
          const highlightText = getHighlightText(doc.highlight);

          const title =
            doc.titulo ||
            doc.nombre_archivo ||
            doc.fuente ||
            `Sentencia ${index + 1}`;

          return {
            id: doc.id || doc.nombre_archivo || index.toString(),
            name: highlightText || title,
            date: formatDate(doc.fecha_indexacion),
            url: doc.url_pdf || null,
            pagina: doc.pagina || null,
            fuente: doc.fuente || null,
            tipo_documento: doc.tipo_documento || null,
            tesaurio_nombre: doc.tesaurio_nombre || null,
            tesaurio_slug: doc.tesaurio_slug || null,
            nombre_archivo: doc.nombre_archivo || null,
          };
        },
      );

      setDocuments(mapped);
    } catch (err) {
      console.log("Error:", err);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchText("");
    setDebouncedText("");
    setSelectedMonth("");
    setSelectedYear("");
    setSelectedTipoDocumento("");
    setSelectedTesaurioPath([]);
    setSelectedFuente("");
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedText(searchText);
    }, 600);

    return () => clearTimeout(timeout);
  }, [searchText]);

  useEffect(() => {
    const hasAnyFilter =
      debouncedText.trim() !== "" ||
      selectedMonth !== "" ||
      selectedYear !== "" ||
      selectedTipoDocumento !== "" ||
      selectedTesaurioSlug !== "" ||
      selectedFuente !== "";

    if (!hasAnyFilter) {
      setDocuments([]);
      return;
    }

    fetchDocuments();
  }, [
    debouncedText,
    selectedMonth,
    selectedYear,
    selectedTipoDocumento,
    selectedTesaurioSlug,
    selectedFuente,
  ]);

  const sharePDF = async (url: string, filename: string) => {
    try {
      const finalUrl = url.startsWith("http")
        ? url
        : `http://143.244.163.112:3000${url}`;

      const safeFilename = filename.endsWith(".pdf")
        ? filename
        : `${filename}.pdf`;

      const fileUri = FileSystem.documentDirectory + safeFilename;

      const { uri } = await FileSystem.downloadAsync(finalUrl, fileUri);

      console.log("Descargado en:", uri);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      }
    } catch (error) {
      console.log("Error descargando PDF:", error);
    }
  };

  const renderChip = ({
    item,
    selectedValue,
    onSelect,
  }: {
    item: FilterOption;
    selectedValue: string;
    onSelect: (value: string) => void;
  }) => {
    const isActive = selectedValue === item.value;

    return (
      <TouchableOpacity
        style={[styles.filterChip, isActive && styles.filterChipActive]}
        onPress={() => onSelect(isActive ? "" : item.value)}
      >
        <Text
          style={[
            styles.filterChipText,
            isActive && styles.filterChipTextActive,
          ]}
        >
          {item.label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderDocument = ({ item }: { item: Document }) => (
    <View style={styles.documentCard}>
      <View style={styles.documentIcon}>
        <Text style={styles.documentIconText}>PDF</Text>
      </View>

      <Text style={styles.documentName} numberOfLines={3}>
        {item.name}
      </Text>

      <Text style={styles.documentDate}>{item.date}</Text>

      {item.tipo_documento ? (
        <Text style={styles.documentMeta} numberOfLines={1}>
          Tipo: {item.tipo_documento}
        </Text>
      ) : null}

      {item.tesaurio_nombre ? (
        <Text style={styles.documentMeta} numberOfLines={2}>
          Materia: {item.tesaurio_nombre}
        </Text>
      ) : null}

      {item.fuente ? (
        <Text style={styles.documentMeta} numberOfLines={1}>
          Fuente: {item.fuente}
        </Text>
      ) : null}

      {item.nombre_archivo ? (
        <Text style={styles.documentMeta} numberOfLines={1}>
          Archivo: {item.nombre_archivo}
        </Text>
      ) : null}

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            item.url ? styles.viewButton : styles.disabledButton,
          ]}
          disabled={!item.url}
          onPress={() => {
            if (!item.url) return;

            router.push({
              pathname: "/PdfScreen",
              params: {
                url: item.url,
                query: debouncedText,
                pagina: item.pagina || undefined,
              },
            });
          }}
        >
          <Text style={styles.actionText}>Ver</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            item.url ? styles.downloadButton : styles.disabledButton,
          ]}
          disabled={!item.url}
          onPress={() => {
            if (!item.url) return;
            sharePDF(item.url, item.name);
          }}
        >
          <Text style={styles.actionText}>Descargar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={documents}
        renderItem={renderDocument}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.screenContent}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View>
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar sentencias..."
              value={searchText}
              onChangeText={setSearchText}
            />

            <View style={styles.filtersRow}>
              <View style={styles.filterHeader}>
                <Text style={styles.filterHeaderTitle}>Filtros</Text>

                <TouchableOpacity onPress={clearFilters}>
                  <Text style={styles.clearFiltersText}>Limpiar</Text>
                </TouchableOpacity>
              </View>

              {/* <View style={styles.filterContainer}>
                <Text style={styles.filterTitle}>Mes</Text>

                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  data={months.map((month) => ({
                    label: month,
                    value: month,
                  }))}
                  keyExtractor={(item) => item.value}
                  renderItem={({ item }) =>
                    renderChip({
                      item,
                      selectedValue: selectedMonth,
                      onSelect: setSelectedMonth,
                    })
                  }
                />
              </View>

              <View style={styles.filterContainer}>
                <Text style={styles.filterTitle}>Año</Text>

                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  data={years.map((year) => ({
                    label: year,
                    value: year,
                  }))}
                  keyExtractor={(item) => item.value}
                  renderItem={({ item }) =>
                    renderChip({
                      item,
                      selectedValue: selectedYear,
                      onSelect: setSelectedYear,
                    })
                  }
                />
              </View>

              <View style={styles.filterContainer}>
                <Text style={styles.filterTitle}>Tipo de documento</Text>

                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  data={tiposDocumento}
                  keyExtractor={(item) => item.value || "todos-tipo-documento"}
                  renderItem={({ item }) =>
                    renderChip({
                      item,
                      selectedValue: selectedTipoDocumento,
                      onSelect: setSelectedTipoDocumento,
                    })
                  }
                />
              </View>*/}

              {getTesaurioLevelsToRender().map((level) => {
                const nodes = getNodesForLevel(level);

                if (!nodes.length) return null;

                return (
                  <View
                    style={styles.filterContainer}
                    key={`tesaurio-level-${level}`}
                  >
                    <Text style={styles.filterTitle}>
                      {getTesaurioLevelTitle(level)}
                    </Text>

                    <FlatList
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      data={toFilterOptions(nodes)}
                      keyExtractor={(item) =>
                        item.value || `todos-tesaurio-level-${level}`
                      }
                      renderItem={({ item }) =>
                        renderChip({
                          item,
                          selectedValue: getSelectedValueForLevel(level),
                          onSelect: (value) =>
                            handleSelectTesaurioLevel(level, value),
                        })
                      }
                    />
                  </View>
                );
              })}

              {/*<View style={styles.filterContainer}>
                <Text style={styles.filterTitle}>Fuente</Text>

                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  data={fuentes}
                  keyExtractor={(item) => item.value || "todas-fuentes"}
                  renderItem={({ item }) =>
                    renderChip({
                      item,
                      selectedValue: selectedFuente,
                      onSelect: setSelectedFuente,
                    })
                  }
                />
              </View>*/}
            </View>

            <Text style={styles.resultsLabel}>
              Resultados ({documents.length})
            </Text>
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator
              style={styles.loader}
              size="large"
              color="#007AFF"
            />
          ) : shouldAskForLastFilter() ? (
            <Text style={styles.emptyText}>
              Selecciona el último filtro disponible para buscar sentencias.
            </Text>
          ) : (
            <Text style={styles.emptyText}>No se encontraron sentencias.</Text>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingTop: 10,
  },

  screenContent: {
    paddingBottom: 24,
    paddingHorizontal: 15,
  },

  loader: {
    marginTop: 30,
  },

  searchInput: {
    marginBottom: 15,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },

  filtersRow: {
    marginBottom: 10,
  },

  filterHeader: {
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  filterHeaderTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#222",
  },

  clearFiltersText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#007AFF",
  },

  filterContainer: {
    marginBottom: 12,
  },

  filterTitle: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: "600",
    color: "#222",
  },

  filterChip: {
    marginRight: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "#fff",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ddd",
  },

  filterChipActive: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },

  filterChipText: {
    color: "#333",
    fontSize: 13,
  },

  filterChipTextActive: {
    color: "#fff",
    fontWeight: "600",
  },

  resultsLabel: {
    marginBottom: 10,
    fontWeight: "600",
    fontSize: 14,
    color: "#222",
  },

  documentCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 12,
    alignItems: "center",
    padding: 12,
  },

  documentIcon: {
    width: 60,
    height: 80,
    borderRadius: 6,
    backgroundColor: "#e9eef7",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#d6deee",
  },

  documentIconText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#007AFF",
  },

  documentName: {
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 4,
    color: "#222",
  },

  documentDate: {
    fontSize: 11,
    color: "#777",
    marginBottom: 4,
  },

  documentMeta: {
    fontSize: 11,
    color: "#666",
    textAlign: "center",
    marginTop: 2,
  },

  actionsContainer: {
    flexDirection: "row",
    marginTop: 10,
    gap: 10,
  },

  actionButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
  },

  viewButton: {
    backgroundColor: "#007AFF",
  },

  downloadButton: {
    backgroundColor: "#28a745",
  },

  disabledButton: {
    backgroundColor: "#aaa",
  },

  actionText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 12,
  },

  emptyText: {
    textAlign: "center",
    marginTop: 30,
    color: "#777",
  },
});
