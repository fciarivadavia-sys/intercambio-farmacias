"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../src/lib/supabase";

type Props = {
  publicacionId: string;
  estadoActual: string;
};

const estados = ["activa", "pausada", "cancelada", "concretada"] as const;

export default function EstadoPublicacionActions({
  publicacionId,
  estadoActual,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  async function cambiarEstado(nuevoEstado: string) {
    const { error } = await supabase
      .from("publicaciones")
      .update({
        estado: nuevoEstado,
        fecha_actualizacion: new Date().toISOString(),
      })
      .eq("id", publicacionId);

    if (error) {
      alert(`Error al actualizar estado: ${error.message}`);
      return;
    }

    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <div style={{ marginTop: "18px" }}>
      <p
        style={{
          margin: "0 0 10px 0",
          fontSize: "14px",
          color: "#aab4d6",
        }}
      >
        Cambiar estado
      </p>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
        }}
      >
        {estados.map((estado) => {
          const activo = estadoActual === estado;

          return (
            <button
              key={estado}
              type="button"
              disabled={isPending || activo}
              onClick={() => cambiarEstado(estado)}
              style={{
                background: activo ? "#2f4f9d" : "#1d2742",
                color: "#ffffff",
                border: activo ? "1px solid #5f8cff" : "1px solid #324066",
                borderRadius: "10px",
                padding: "10px 12px",
                fontSize: "14px",
                cursor: activo ? "default" : "pointer",
                opacity: isPending ? 0.7 : 1,
                textTransform: "capitalize",
              }}
            >
              {isPending && !activo ? "Actualizando..." : estado}
            </button>
          );
        })}
      </div>
    </div>
  );
}