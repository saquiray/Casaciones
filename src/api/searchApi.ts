const BASE_URL = "http://143.244.163.112:3000";

export const searchDocuments = async ({
  origen,
  query,
  month,
  year,
}: {
  origen?: string;
  query?: string;
  month?: string;
  year?: string;
}) => {
  try {
    console.log("Buscando con:", { origen, query, month, year });

    const params = new URLSearchParams();

    if (origen) console.log("origen:", origen);
    if (query) params.append("q", query);
    if (month) params.append("month", month);
    if (year) params.append("year", year);

    const url = `${BASE_URL}/search?${params.toString()}`;

    console.log("URL de búsqueda:", url);

    const res = await fetch(url);

    console.log("Respuesta HTTP:", res.status, res.statusText);

    if (!res.ok) {
      throw new Error(`Error HTTP: ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.error("Error en searchDocuments:", error);
    return {
      total: 0,
      results: [],
      error: true,
    };
  }
};