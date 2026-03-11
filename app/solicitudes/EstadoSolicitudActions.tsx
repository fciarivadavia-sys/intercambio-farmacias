"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../src/lib/supabase-browser";

type Props = {
  solicitudId: string;
  estadoActual: string;
};

const estados = [
  { value: "pendiente", label: "Pendiente" },
  { value: "aceptada", label: "Aceptar" },
  { value: "rechazada", label: "Rechazar" },
  { value: "concretada", label: "Concretar" },
] as const;

export default function EstadoSolicitudActions({
  solicitudId,
  estadoActual,
}: Props) {
  const supabase = createClient();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  async function cambiarEstado(nuevoEstado: string) {
    if (estadoActual === "concretada") {
      alert("La solicitud ya está concretada y no puede modificarse.");
      return;
    }

    if (nuevoEstado === "concretada") {
      const confirmar = window.confirm(
        "¿Querés concretar esta solicitud? Esto descontará unidades disponibles de la publicación."
      );

      if (!confirmar) return;

      const { error } = await supabase.rpc("concretar_solicitud", {
        p_solicitud_id: solicitudId,
      });

      if (error) {
        alert(`Error al concretar solicitud: ${error.message}`);
        return;
      }

      startTransition(() => {
        router.refresh();
      });

      return;
    }

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
        gap: "8px",
      }}
    >
      {estados.map((estado) => {
        const activo = estadoActual === estado.value;
        const bloqueado = estadoActual === "concretada";

        return (
          <button
            key={estado.value}
            type="button"
            disabled={isPending || activo || bloqueado}
            onClick={() => cambiarEstado(estado.value)}
            style={{
              ...getButtonStyle(estado.value, activo),
              cursor: activo || bloqueado ? "default" : "pointer",
              opacity: isPending || bloqueado ? 0.7 : 1,
            }}
          >
            {isPending && !activo ? "Actualizando..." : estado.label}
          </button>
        );
      })}
    </div>
  );
}

function getButtonStyle(estado: string, activo: boolean): React.CSSProperties {
  const base: React.CSSProperties = {
    borderRadius: "10px",
    padding: "8px 12px",
    fontSize: "13px",
    fontWeight: 600,
    border: "1px solid transparent",
    transition: "all 0.15s ease",
    whiteSpace: "nowrap",
  };

  if (activo) {
    return {
      ...base,
      background: "#2f4f9d",
      color: "#ffffff",
      border: "1px solid #5f8cff",
    };
  }

  if (estado === "aceptada") {
    return {
      ...base,
      background: "#10281c",
      color: "#b6f2c8",
      border: "1px solid #1f5b3b",
    };
  }

  if (estado === "rechazada") {
    return {
      ...base,
      background: "#3a1010",
      color: "#ffb9b9",
      border: "1px solid #6a1f1f",
    };
  }

  if (estado === "concretada") {
    return {
      ...base,
      background: "#1d2742",
      color: "#d7e2ff",
      border: "1px solid #324066",
    };
  }

  return {
    ...base,
    background: "#0f1528",
    color: "#c8d2f0",
    border: "1px solid #24304f",
  };
}