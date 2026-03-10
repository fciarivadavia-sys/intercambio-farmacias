"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "../../../../src/lib/supabase-browser";
import AppShell from "../../../components/AppShell";
import { styles } from "../../../../src/lib/ui";

type Publicacion = {
  id: string;
  producto: string;
  codigo: string | null;
  vencimiento: string;
  cantidad_disponible: number;
  descuento_pvp: number | null;
  estado: string;
  farmacia_id: string;
  farmacias: {
    nombre: string;
  } | null;
};

type FarmaciaActual = {
  id: string;
  nombre: string;
  email: string;
};

export default function SolicitarOportunidadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = createClient();

  const [farmaciaActual, setFarmaciaActual] = useState<FarmaciaActual | null>(null);
  const [publicacion, setPublicacion] = useState<Publicacion | null>(null);
  const [cantidadSolicitada, setCantidadSolicitada] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    async function cargarDatos() {
      setCargando(true);
      setError("");

      const resolvedParams = await params;

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError("No hay una sesión activa.");
        setCargando(false);
        return;
      }

      const { data: farmaciaData, error: farmaciaError } = await supabase
        .from("farmacias")
        .select("id, nombre, email")
        .eq("auth_user_id", user.id)
        .single();

      if (farmaciaError || !farmaciaData) {
        setError("No se pudo identificar la farmacia actual.");
        setCargando(false);
        return;
      }

      setFarmaciaActual(farmaciaData);

      const { data: pubData, error: pubError } = await supabase
        .from("publicaciones")
        .select(`
          id,
          producto,
          codigo,
          vencimiento,
          cantidad_disponible,
          descuento_pvp,
          estado,
          farmacia_id,
          farmacias (
            nombre
          )
        `)
        .eq("id", resolvedParams.id)
        .single();

      if (pubError || !pubData) {
        setError("No se pudo cargar la publicación.");
        setCargando(false);
        return;
      }

      setPublicacion(pubData as Publicacion);
      setCargando(false);
    }

    cargarDatos();
  }, [params, supabase]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setOk("");

    if (!farmaciaActual) {
      setError("No se pudo identificar la farmacia actual.");
      return;
    }

    if (!publicacion) {
      setError("No se encontró la publicación.");
      return;
    }

    const cantidad = Number(cantidadSolicitada);

    if (!cantidadSolicitada || Number.isNaN(cantidad) || cantidad <= 0) {
      setError("Ingresá una cantidad válida.");
      return;
    }

    setGuardando(true);

    const { error: insertError } = await supabase.from("solicitudes").insert([
      {
        publicacion_id: publicacion.id,
        farmacia_solicitante_id: farmaciaActual.id,
        cantidad_solicitada: cantidad,
        mensaje: mensaje.trim() || null,
        estado: "pendiente",
        fecha_solicitud: new Date().toISOString(),
      },
    ]);

    if (insertError) {
      setError(insertError.message);
      setGuardando(false);
      return;
    }

    setOk("Solicitud enviada correctamente.");
    setCantidadSolicitada("");
    setMensaje("");
    setGuardando(false);
  }

  if (cargando) {
    return (
      <main style={styles.page}>
        <div style={styles.container}>
          <div style={styles.card}>Cargando publicación...</div>
        </div>
      </main>
    );
  }

  if (!farmaciaActual || !publicacion) {
    return (
      <main style={styles.page}>
        <div style={styles.container}>
          <div
            style={{
              ...styles.card,
              maxWidth: "700px",
              margin: "80px auto 0 auto",
            }}
          >
            <h1 style={styles.title}>Enviar solicitud</h1>
            <p style={{ ...styles.subtitle, lineHeight: 1.8 }}>
              No se pudo cargar la publicación.
            </p>

            {error && <div style={{ ...styles.error, marginTop: "16px" }}>{error}</div>}

            <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
              <Link href="/oportunidades" style={styles.buttonPrimary}>
                Volver a oportunidades
              </Link>
              <Link href="/" style={styles.buttonSecondary}>
                Volver al panel
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const farmaciaPub = Array.isArray(publicacion.farmacias)
    ? publicacion.farmacias[0]
    : publicacion.farmacias;

  return (
    <AppShell
      farmaciaNombre={farmaciaActual.nombre}
      titulo="Enviar solicitud"
      subtitulo="Confirmá el interés en esta publicación"
      acciones={
        <>
          <Link href="/oportunidades" style={styles.buttonPrimary}>
            Volver a oportunidades
          </Link>
          <Link href="/" style={styles.buttonSecondary}>
            Volver al panel
          </Link>
        </>
      }
    >
      <div style={{ ...styles.card, marginBottom: "24px" }}>
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: "980px",
            }}
          >
            <thead>
              <tr style={{ borderBottom: "1px solid #2a3350" }}>
                <th style={{ ...thStyle, width: "180px" }}>Cod. barra</th>
                <th style={{ ...thStyle, minWidth: "320px" }}>Descripción</th>
                <th style={{ ...thStyle, textAlign: "right", width: "110px" }}>
                  Cantidad
                </th>
                <th style={{ ...thStyle, textAlign: "right", width: "110px" }}>
                  % Descto
                </th>
                <th style={{ ...thStyle, minWidth: "180px" }}>Farmacia</th>
                <th style={{ ...thStyle, width: "130px" }}>Vencimiento</th>
                <th style={{ ...thStyle, textAlign: "center", width: "120px" }}>
                  Estado
                </th>
              </tr>
            </thead>

            <tbody>
              <tr style={{ borderBottom: "1px solid #24304f" }}>
                <td style={tdStyle}>{publicacion.codigo || "-"}</td>
                <td style={tdStyle}>{publicacion.producto}</td>
                <td style={{ ...tdStyle, textAlign: "right" }}>
                  {publicacion.cantidad_disponible}
                </td>
                <td style={{ ...tdStyle, textAlign: "right" }}>
                  {publicacion.descuento_pvp ?? "-"}
                </td>
                <td style={tdStyle}>{farmaciaPub?.nombre || "-"}</td>
                <td style={tdStyle}>{formatearVencimiento(publicacion.vencimiento)}</td>
                <td style={{ ...tdStyle, textAlign: "center" }}>
                  <span style={estadoChipStyle}>{publicacion.estado}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={styles.card}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "220px 220px auto",
            gap: "14px",
            alignItems: "end",
            marginBottom: "16px",
          }}
        >
          <div>
            <label htmlFor="cantidadSolicitada" style={styles.label}>
              Cantidad solicitada *
            </label>
            <input
              id="cantidadSolicitada"
              type="number"
              value={cantidadSolicitada}
              onChange={(e) => setCantidadSolicitada(e.target.value)}
              placeholder="Ej: 2"
              style={styles.input}
            />
          </div>

          <button type="submit" disabled={guardando} style={buttonPrimaryStyle}>
            {guardando ? "Enviando..." : "Enviar solicitud"}
          </button>
        </div>

        <div style={{ maxWidth: "720px" }}>
          <label htmlFor="mensaje" style={styles.label}>
            Mensaje opcional
          </label>
          <textarea
            id="mensaje"
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            rows={4}
            placeholder="Escribí un mensaje para la farmacia"
            style={textareaStyle}
          />
        </div>

        {error && <div style={{ ...styles.error, marginTop: "16px" }}>{error}</div>}
        {ok && <div style={{ ...styles.success, marginTop: "16px" }}>{ok}</div>}
      </form>
    </AppShell>
  );
}

function formatearVencimiento(valor: string) {
  const fecha = new Date(valor);
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const anio = fecha.getFullYear();
  return `${mes}/${anio}`;
}

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "14px 12px",
  fontSize: "13px",
  color: "#aab4d6",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.04em",
};

const tdStyle: React.CSSProperties = {
  padding: "14px 12px",
  fontSize: "15px",
  color: "#ffffff",
};

const estadoChipStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "6px 10px",
  borderRadius: "999px",
  border: "1px solid #24304f",
  background: "#0f1528",
  color: "#9fb0e8",
  textTransform: "capitalize",
  fontSize: "13px",
};

const textareaStyle: React.CSSProperties = {
  ...styles.input,
  resize: "vertical",
};

const buttonPrimaryStyle: React.CSSProperties = {
  ...styles.buttonPrimary,
  cursor: "pointer",
  height: "44px",
};