export type Profile = {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  ciudad: string | null;
  whatsapp: string | null;
  created_at: string;
};

export type Album = {
  id: string;
  nombre: string;
  descripcion: string | null;
  imagen_portada: string | null;
  total_barajitas: number;
  activo: boolean;
  created_at: string;
};

export type Barajita = {
  id: string;
  album_id: string;
  numero: string;
  orden: number;
  nombre: string | null;
  equipo: string | null;
  rareza: string | null;
  imagen_url: string | null;
};

export type ColeccionItem = {
  user_id: string;
  barajita_id: string;
  cantidad: number;
  updated_at: string;
};

export type ColeccionResumen = {
  user_id: string;
  album_id: string;
  tiene: number;
  busca: number;
  repetidas: number;
};
