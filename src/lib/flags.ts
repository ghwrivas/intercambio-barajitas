/**
 * Mapeo de nombre de equipo/país (en español, tal como se guarda en BD)
 * al código ISO 3166-1 alpha-2.
 *
 * Se usa con la librería `flag-icons` para mostrar banderas SVG:
 *   <span className={`fi fi-${getIso2(equipo)}`} />
 *
 * flag-icons usa la clase `fi-XX` donde XX es el código ISO en minúsculas.
 * Docs: https://github.com/lipis/flag-icons
 */
const EQUIPO_ISO: Record<string, string> = {
  // CONMEBOL
  Argentina: "ar",
  Brasil: "br",
  Colombia: "co",
  Uruguay: "uy",
  Ecuador: "ec",
  Venezuela: "ve",
  // CONCACAF
  "Estados Unidos": "us",
  Canadá: "ca",
  México: "mx",
  Panamá: "pa",
  Jamaica: "jm",
  "Costa Rica": "cr",
  // UEFA
  Alemania: "de",
  España: "es",
  Portugal: "pt",
  Francia: "fr",
  "Países Bajos": "nl",
  Bélgica: "be",
  Italia: "it",
  Croacia: "hr",
  Suiza: "ch",
  Austria: "at",
  Hungría: "hu",
  Eslovaquia: "sk",
  Serbia: "rs",
  Turquía: "tr",
  Inglaterra: "gb-eng", // flag-icons soporta subdivisiones GB
  Escocia: "gb-sct",
  "Bosnia y Herzegovina": "ba",
  "República Checa": "cz",
  // AFC
  Japón: "jp",
  "Corea del Sur": "kr",
  Irán: "ir",
  Australia: "au",
  "Arabia Saudita": "sa",
  Catar: "qa",
  Uzbekistán: "uz",
  Indonesia: "id",
  // CAF
  Argelia: "dz",
  Marruecos: "ma",
  Senegal: "sn",
  Nigeria: "ng",
  Egipto: "eg",
  Camerún: "cm",
  Sudáfrica: "za",
  "República Democrática del Congo": "cd",
  Mali: "ml",
  Túnez: "tn",
  "Costa de Marfil": "ci",
  "Cabo Verde": "cv",
  "Curazao": "cw",
  Ghana: "gh",
  "Haití": "ht",
  Irak: "iq",
  Jordania: "jo",
  Noruega: "no",
  Paraguay: "py",
  Escócia: "gb-sct",
  Suecia: "se",
  // OFC
  "Nueva Zelanda": "nz",
};

/**
 * Devuelve el código ISO 3166-1 alpha-2 (en minúsculas) para un equipo/país.
 * Retorna null si el nombre no está mapeado.
 * Úsalo así: <span className={`fi fi-${getCountryIso(equipo)`} />
 */
export function getCountryIso(equipo: string): string | null {
  return EQUIPO_ISO[equipo] ?? null;
}
