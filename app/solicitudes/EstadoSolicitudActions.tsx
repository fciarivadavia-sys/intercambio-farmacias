"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../src/lib/supabase-browser";

type Props = {
  solicitudId: string;
  estadoActual: string;
};

const estados = ["pendiente", "aceptada", "rechazada", "concretada"] as const;

export default function EstadoSolicitudActions({
  solicitudId,
  estadoActual,
}: Props) {
  const supabase = createClient();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  async function cambiarEstado(nuevoEstado: string) {
    const { error } = await supabase
      .from("solicitudes")
      .update({
        estado: nuevoEstado,
        fecha_respuesta: new Date().toISOString(),
      })
      .eq("id", solicitudId);

    if (error) {
      alert(`Error al actualizar solicitud: ${error.message}`);
      return;
    }

    startTransition(() => {
      router.refresh();
    });
  }

  return (
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
  );
}