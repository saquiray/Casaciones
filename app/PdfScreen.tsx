import { useLocalSearchParams } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";

export default function PdfScreen() {
    const { url, query } = useLocalSearchParams();

    const pdfUrl = `http://143.244.163.112:3000${url}`;

    const viewerUrl =
        `https://mozilla.github.io/pdf.js/web/viewer.html` +
        `?file=${encodeURIComponent(pdfUrl)}` +
        `#search=${encodeURIComponent((query as string) || "")}`;

    // 🔥 CSS móvil
    const injectedCSS = `
        const style = document.createElement('style');
        style.innerHTML = \`
            #toolbarContainer {
                position: fixed !important;
                top: 0 !important;
                z-index: 9999 !important;
                width: 100% !important;
            }

            #viewerContainer {
                top: 56px !important;
            }

            .page {
                margin-left: auto !important;
                margin-right: auto !important;
            }

            body {
            }
        \`;

        document.head.appendChild(style);

        // 🔥 ajustar zoom automáticamente
        setTimeout(() => {
            const scaleSelect = document.getElementById("scaleSelect");
            if(scaleSelect){
                scaleSelect.value = "page-width";
                scaleSelect.dispatchEvent(new Event("change"));
            }
        }, 1500);

        true;
    `;

    return (
        <View style={styles.container}>
            <WebView
                source={{ uri: viewerUrl }}
                javaScriptEnabled
                domStorageEnabled
                mixedContentMode="always"
                startInLoadingState
                injectedJavaScript={injectedCSS}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
    },
});
/*import { useLocalSearchParams } from "expo-router";
import React, { useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import Pdf from "react-native-pdf";

export default function PdfScreen() {

    const { url, query, pagina } = useLocalSearchParams();

    const pdfRef = useRef<any>(null);

    const pdfUrl = `http://143.244.163.112:3000${url}`;

    const initialPage = Number(pagina) || 1;

    return (
        <View style={styles.container}>

            {/* 🔍 Texto buscado }
            {query ? (
                <View style={styles.searchContainer}>
                    <Text style={styles.searchText}>
                        Buscando: "{query}"
                    </Text>

                    <Text style={styles.pageText}>
                        Página: {initialPage}
                    </Text>
                </View>
            ) : null}

            {/* 📄 PDF }
            <Pdf
                ref={pdfRef}
                source={{ uri: pdfUrl }}

                // 🔥 abrir en página encontrada
                page={initialPage}

                style={styles.pdf}
                trustAllCerts={false}

                onLoadComplete={(numberOfPages) => {
                    console.log(`PDF cargado: ${numberOfPages} páginas`);
                }}

                onPageChanged={(page) => {
                    console.log("Página:", page);
                }}

                onError={(error) => {
                    console.log(error);
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
    },

    pdf: {
        flex: 1,
        width: "100%",
        height: "100%",
    },

    searchContainer: {
        padding: 10,
        backgroundColor: "#111",
    },

    searchText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
    },

    pageText: {
        color: "#aaa",
        fontSize: 12,
        marginTop: 4,
    },
});*/