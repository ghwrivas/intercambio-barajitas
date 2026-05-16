import { createClient } from "@/lib/supabase/server";
import NavbarClient from "./NavbarClient";

export default async function Navbar() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("display_name, avatar_url")
      .eq("id", user.id)
      .single();
    profile = data;
  }

  return (
    <NavbarClient
      isAuthed={!!user}
      displayName={profile?.display_name ?? user?.email ?? null}
      avatarUrl={profile?.avatar_url ?? null}
    />
  );
}
