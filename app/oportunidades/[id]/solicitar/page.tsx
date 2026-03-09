"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "../../../../src/lib/supabase-browser";

type Publicacion = {
  id: string;
  producto: string;
  laboratorio: string | null;
  presentacion: string | null;
  codigo: string | null;
  lote: string;
  vencimiento: string;
  cantidad_disponible: number;
  precio_referencia: number | null;
  descuento_pvp: number | null;
  observaciones: string | null;
  estado: string;
  farmacia_id: string;
};

type FarmaciaActual = {
  id: string;
  nombre: string;
  email: string;
};

export default function SolicitarPage() {
  const supabase = createClient();
  const params = useParams();
  const publicacionId = params?.id as string;

  const [publicacion, setPublicacion] = useState<Publicacion | null>(null);
  const [farmaciaActual, setFarmaciaActual] = useState<FarmaciaActual | null>(null);
  const [cantidad, setCantidad] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  useEffect(() => {
    async function cargar() {
      if (!publicacionId) {
        setError("No se recibió el identificador de la publicación.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError("No hay una sesión activa.");
        setLoading(false);
        return;
      }

      const { data: farmaciaData, error: farmaciaError } = await supabase
        .from("farmacias")
        .select("id, nombre, email")
        .eq("auth_user_id", user.id)
        .single();

      if (farmaciaError || !farmaciaData) {
        setError("No se pudo encontrar la farmacia autenticada.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("publicaciones")
        .select("*")
        .eq("id", publicacionId)
        .single();

      if (error) {
        setError(`No se pudo cargar la publicación: ${error.message}`);
        setLoading(false);
        return;
      }

      setFarmaciaActual(farmaciaData);
      setPublicacion(data);
      setLoading(false);
    }

    cargar();
  }, [publicacionId, supabase]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setOk("");

    if (!publicacion) {
      setError("No se encontró la publicación.");
      return;
    }

    if (!farmaciaActual) {
      setError("No hay farmacia autenticada.");
      return;
    }

    if (farmaciaActual.id === publicacion.farmacia_id) {
      setError("No podés generar una solicitud sobre tu propia publicación.");
      return;
    }

    const cantidadNumerica = Number(cantidad);

    if (!cantidad || Number.isNaN(cantidadNumerica) || cantidadNumerica <= 0) {
      setError("La cantidad solicitada debe ser mayor a 0.");
      return;
    }

    if (cantidadNumerica > publicacion.cantidad_disponible) {
      setError("La cantidad solicitada no puede superar la disponible.");
      return;
    }

    setGuardando(true);

    try {
      const { error: insertError } = await supabase.from("solicitudes").insert([
        {
          publicacion_id: publicacion.id,
          farmacia_solicitante_id: farmaciaActual.id,
          cantidad_solicitada: cantidadNumerica,
          mensaje: mensaje.trim() || null,
          estado: "pendiente",
        },
      ]);

      if (insertError) {
        throw new Error(insertError.message);
      }

      setOk("Solicitud enviada correctamente.");
      setCantidad("");
      setMensaje("");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Ocurrió un error inesperado.";
      setError(message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0b1020",
        color: "#ffffff",
        fontFamily: "Arial, sans-serif",
        padding: "32px",
      }}
    >
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: "34px" }}>Enviar solicitud</h1>
            <p style={{ marginTop: "8px", color: "#aab4d6" }}>
              Confirmá el interés en esta publicación
            </p>
          </div>

          <Link href="/oportunidades" style={secondaryLinkStyle}>
            Volver a oportunidades
          </Link>
        </div>

        {loading && <div style={cardStyle}>Cargando publicación...</div>}

        {error && !publicacion && (
          <div
            style={{
              ...cardStyle,
              background: "#3a1010",
              color: "#ffb9b9",
            }}
          >
            {error}
          </div>
        )}

        {publicacion && (
          <>
            <div style={cardStyle}>
              <h2 style={{ marginTop: 0, fontSize: "26px" }}>
                {publicacion.producto}
              </h2>

              {farmaciaActual && (
                <p style={{ color: "#9fb0e8", marginTop: "-4px" }}>
                  Farmacia activa: {farmaciaActual.nombre}
                </p>
              )}

              <div style={{ lineHeight: 1.8, color: "#d8e0ff" }}>
                <p style={{ margin: 0 }}>
                  <strong>Laboratorio:</strong> {publicacion.laboratorio || "-"}
                </p>
                <p style={{ margin: 0 }}>
                  <strong>Presentación:</strong> {publicacion.presentacion || "-"}
                </p>
                <p style={{ margin: 0 }}>
                  <strong>Código:</strong> {publicacion.codigo || "-"}
                </p>
                <p style={{ margin: 0 }}>
                  <strong>Lote:</strong> {publicacion.lote}
                </p>
                <p style={{ margin: 0 }}>
                  <strong>Vencimiento:</strong> {publicacion.vencimiento}
                </p>
                <p style={{ margin: 0 }}>
                  <strong>Cantidad disponible:</strong>{" "}
                  {publicacion.cantidad_disponible}
                </p>
                <p style={{ margin: 0 }}>
                  <strong>Precio referencia:</strong>{" "}
                  {publicacion.precio_referencia ?? "-"}
                </p>
                <p style={{ margin: 0 }}>
                  <strong>Descuento PVP:</strong>{" "}
                  {publicacion.descuento_pvp ?? "-"}
                </p>
                <p style={{ margin: 0 }}>
                  <strong>Estado:</strong> {publicacion.estado}
                </p>
              </div>

              {publicacion.observaciones && (
                <div
                  style={{
                    marginTop: "14px",
                    padding: "12px",
                    background: "#0f1528",
                    borderRadius: "12px",
                    border: "1px solid #24304f",
                    color: "#c8d2f0",
                  }}
                >
                  <strong>Observaciones:</strong> {publicacion.observaciones}
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} style={{ ...cardStyle, marginTop: "20px" }}>
              <h3 style={{ marginTop: 0 }}>Datos de la solicitud</h3>

              <div style={{ marginBottom: "16px" }}>
                <label
                  htmlFor="cantidad"
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontSize: "14px",
                    color: "#cbd5f2",
                  }}
                >
                  Cantidad solicitada *
                </label>
                <input
                  id="cantidad"
                  name="cantidad"
                  type="number"
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                  placeholder="Ej: 2"
                  style={inputStyle}
                />
              </div>

              <div>
                <label
                  htmlFor="mensaje"
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontSize: "14px",
                    color: "#cbd5f2",
                  }}
                >
                  Mensaje opcional
                </label>
                <textarea
                  id="mensaje"
                  name="mensaje"
                  rows={5}
                  value={mensaje}
                  onChange={(e) => setMensaje(e.target.value)}
                  placeholder="Ej: Me interesa para una necesidad puntual de stock"
                  style={textareaStyle}
                />
              </div>

              {error && (
                <div
                  style={{
                    marginTop: "18px",
                    background: "#3a1010",
                    color: "#ffb9b9",
                    padding: "14px",
                    borderRadius: "12px",
                  }}
                >
                  {error}
                </div>
              )}

              {ok && (
                <div
                  style={{
                    marginTop: "18px",
                    background: "#10321c",
                    color: "#b6f2c8",
                    padding: "14px",
                    borderRadius: "12px",
                  }}
                >
                  {ok}
                </div>
              )}

              <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
                <button type="submit" disabled={guardando} style={primaryButtonStyle}>
                  {guardando ? "Enviando..." : "Enviar solicitud"}
                </button>

                <Link href="/oportunidades" style={secondaryLinkStyle}>
                  Cancelar
                </Link>
              </div>
            </form>
          </>
        )}
      </div>
    </main>
  );
}

const cardStyle: React.CSSProperties = {
  background: "#151b2e",
  border: "1px solid #2a3350",
  borderRadius: "18px",
  padding: "24px",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "#0f1528",
  color: "#ffffff",
  border: "1px solid #2a3350",
  borderRadius: "10px",
  padding: "12px 14px",
  fontSize: "15px",
  outline: "none",
};

const textareaStyle: React.CSSProperties = {
  width: "100%",
  background: "#0f1528",
  color: "#ffffff",
  border: "1px solid #2a3350",
  borderRadius: "10px",
  padding: "12px 14px",
  fontSize: "15px",
  outline: "none",
  resize: "vertical",
};

const primaryButtonStyle: React.CSSProperties = {
  background: "#4f7cff",
  color: "#ffffff",
  border: "none",
  borderRadius: "10px",
  padding: "12px 18px",
  fontSize: "15px",
  cursor: "pointer",
  textDecoration: "none",
};

const secondaryLinkStyle: React.CSSProperties = {
  background: "#151b2e",
  color: "#ffffff",
  border: "1px solid #2a3350",
  borderRadius: "10px",
  padding: "12px 16px",
  textDecoration: "none",
};