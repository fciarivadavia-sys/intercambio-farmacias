"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../src/lib/supabase-browser";

export default function EliminarPublicacionButton({
  publicacionId,
  producto,
}: {
  publicacionId: string;
  producto: string;
}) {
  const supabase = createClient();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  async function eliminarPublicacion() {
    const confirmado = window.confirm(
      `¿Querés eliminar la publicación de "${producto}"?`
    );

    if (!confirmado) return;

    const { error } = await supabase
      .from("publicaciones")
      .delete()
      .eq("id", publicacionId);

    if (error) {
      alert(`No se pudo eliminar la publicación: ${error.message}`);
      return;
    }

    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={eliminarPublicacion}
      disabled={isPending}
      style={{
        background: "#3a1010",
        color: "#ffb9b9",
        border: "1px solid #6a1f1f",
        borderRadius: "10px",
        padding: "8px 12px",
        fontSize: "13px",
        cursor: "pointer",
        whiteSpace: "nowrap",
      }}
    >
      {isPending ? "Eliminando..." : "Eliminar"}
    </button>
  );
}