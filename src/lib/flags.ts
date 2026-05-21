/**
 * Convierte un código ISO 3166-1 alpha-2 en el emoji de bandera correspondiente.
 * Funciona combinando dos Regional Indicator Symbols (Unicode).
 * Ejemplo: "AR" → 🇦🇷, "BR" → 🇧🇷
 */
function isoToFlag(iso2: string): string {
  return [...iso2.toUpperCase()]
    .map((c) => String.fromCodePoint(c.charCodeAt(0) - 65 + 0x1f1e6))
    .join("");
}

/**
 * Mapeo de nombre de equipo/país (en español, tal como se guarda en BD)
 * al código ISO 3166-1 alpha-2 para generar el emoji de bandera.
 */
const EQUIPO_ISO: Record<string, string> = {
  // CONMEBOL
  Argentina:       "AR",
  Brasil:          "BR",
  Colombia:        "CO",
  Uruguay:         "UY",
  Ecuador:         "EC",
  Venezuela:       "VE",
  // CONCACAF
  "Estados Unidos": "US",
  Canadá:          "CA",
  México:          "MX",
  Panamá:          "PA",
  Jamaica:         "JM",
  "Costa Rica":    "CR",
  // UEFA
  Alemania:        "DE",
  España:          "ES",
  Portugal:        "PT",
  Francia:         "FR",
  "Países Bajos":  "NL",
  Bélgica:         "BE",
  Italia:          "IT",
  Croacia:         "HR",
  Suiza:           "CH",
  Austria:         "AT",
  Hungría:         "HU",
  Eslovaquia:      "SK",
  Serbia:          "RS",
  Turquía:         "TR",
  // UEFA – flags con subdivisión (emoji especial)
  Inglaterra:      "GB", // 🏴󠁧󠁢󠁥󠁮󠁧󠁿 requiere secuencia larga; usamos 🇬🇧 como fallback
  Escocia:         "GB", // ídem
  // AFC
  Japón:           "JP",
  "Corea del Sur": "KR",
  Irán:            "IR",
  Australia:       "AU",
  "Arabia Saudita": "SA",
  Catar:           "QA",
  Uzbekistán:      "UZ",
  Indonesia:       "ID",
  // CAF
  Marruecos:       "MA",
  Senegal:         "SN",
  Nigeria:         "NG",
  Egipto:          "EG",
  Camerún:         "CM",
  Sudáfrica:       "ZA",
  "RD Congo":      "CD",
  Mali:            "ML",
  Túnez:           "TN",
  // OFC
  "Nueva Zelanda": "NZ",
};

/**
 * Devuelve el emoji de bandera para un nombre de equipo/país.
 * Si no se reconoce el nombre, devuelve una cadena vacía.
 */
export function getFlagEmoji(equipo: string): string {
  const iso = EQUIPO_ISO[equipo];
  return iso ? isoToFlag(iso) : "";
}
