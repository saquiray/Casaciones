const BASE_URL = "http://143.244.163.112:3000";

type SearchDocumentsParams = {
  origen?: string;
  query?: string;
  month?: string;
  year?: string;

  tipoDocumento?: string;
  tesaurioSlug?: string;
  tesaurioNombre?: string;
  fuente?: string;
};

export const searchDocuments = async ({
  origen,
  query,
  month,
  year,
  tipoDocumento,
  tesaurioSlug,
  tesaurioNombre,
  fuente,
}: SearchDocumentsParams) => {
  try {
    console.log("Buscando con:", {
      origen,
      query,
      month,
      year,
      tipoDocumento,
      tesaurioSlug,
      tesaurioNombre,
      fuente,
    });

    const params = new URLSearchParams();

    if (query && query.trim() !== "") {
      params.append("q", query.trim());
    }

    if (month) params.append("month", month);
    if (year) params.append("year", year);

    if (tipoDocumento) params.append("tipoDocumento", tipoDocumento);
    if (tesaurioSlug) params.append("tesaurioSlug", tesaurioSlug);
    if (tesaurioNombre) params.append("tesaurioNombre", tesaurioNombre);
    if (fuente) params.append("fuente", fuente);

    let endpoint = "/search/casaciones";

    if (origen === "sentencias") {
      endpoint = "/search/sentencias";
    }

    if (origen === "casaciones") {
      endpoint = "/search/casaciones";
    }

    const queryString = params.toString();

    const url = queryString
      ? `${BASE_URL}${endpoint}?${queryString}`
      : `${BASE_URL}${endpoint}`;

    console.log("URL de búsqueda:", url);

    const res = await fetch(url);

    console.log("Respuesta HTTP:", res.status, res.statusText);

    const data = await res.json();

    if (!res.ok) {
      console.error("Error backend:", data);

      return {
        total: 0,
        results: [],
        error: true,
        message: data?.message || `Error HTTP: ${res.status}`,
      };
    }

    return data;
  } catch (error) {
    console.error("Error en searchDocuments:", error);

    return {
      total: 0,
      results: [],
      error: true,
    };
  }
};
