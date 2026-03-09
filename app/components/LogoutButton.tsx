"use client";

import { useState } from "react";
import { createClient } from "../../src/lib/supabase-browser";
import { styles } from "../../src/lib/ui";

export default function LogoutButton() {
  const supabase = createClient();
  const [saliendo, setSaliendo] = useState(false);

  async function handleLogout() {
    setSaliendo(true);
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <button
      onClick={handleLogout}
      disabled={saliendo}
      style={{
        ...styles.buttonSecondary,
        cursor: "pointer",
      }}
    >
      {saliendo ? "Cerrando..." : "Cerrar sesión"}
    </button>
  );
}