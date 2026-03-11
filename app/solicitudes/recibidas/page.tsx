import Link from "next/link";
import { createClient } from "../../../src/lib/supabase-server";
import { getFarmaciaActual } from "../../../src/lib/getFarmaciaActual";
import EstadoSolicitudActions from "../EstadoSolicitudActions";
import AppShell from "../../components/AppShell";
import { styles } from "../../../src/lib/ui";

type SolicitudRecibidaRow = {
  id: string;
  cantidad_solicitada: number;
  mensaje: string | null;
  estado: string;
  fecha_solicitud: string;
  publicaciones: {
    id: string;
    codigo: string | null;
    producto: string;
    descuento_pvp: number | null;
  } | null;
  farmacias: {
    id?: string;
    nombre: string;
    localidad: string | null;
    provincia: string | null;
    email: string;
  } | null;
};

type SolicitudRecibidaRaw = {
  id: string;
  cantidad_solicitada: number;
  mensaje: string | null;
  estado: string;
  fecha_solicitud: string;
  publicaciones:
    | {
        id: string;
        codigo: string | null;
        producto: string;
        descuento_pvp: number | null;
      }
    | {
        id: string;
        codigo: string | null;
        producto: string;
        descuento_pvp: number | null;
      }[]
    | null;
  farmacias:
    | {
        id?: string;
        nombre: string;
        localidad: string | null;
        provincia: string | null;
        email: string;
      }
    | {
        id?: string;
        nombre: string;
        localidad: string | null;
        provincia: string | null;
        email: string;
      }[]
    | null;
};

export default async function SolicitudesRecibidasPage() {
  const { farmacia, user, error: authError } = await getFarmaciaActual();

  if (!user || !farmacia) {
    return (
      <main style={styles.page}>
        <div style={styles.container}>
          <div
            style={{
              ...styles.card,
              maxWidth: "520px",
              margin: "80px auto 0 auto",
            }}
          >
            <h1 style={styles.title}>Solicitudes recibidas</h1>
            <p style={{ ...styles.subtitle, lineHeight: 1.8 }}>
              Necesitás iniciar sesión para ver las solicitudes recibidas.
            </p>

            {authError && (
              <div style={{ ...styles.error, marginTop: "16px" }}>
                {authError}
              </div>
            )}

            <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
              <Link href="/login" style={styles.buttonPrimary}>
                Ir al login
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

  const supabase = await createClient();

  let solicitudes: SolicitudRecibidaRow[] = [];
  let errorMensaje = "";

  const { data: publicaciones, error: publicacionesError } = await supabase
    .from("publicaciones")
    .select("id")
    .eq("farmacia_id", farmacia.id);

  if (publicacionesError) {
    errorMensaje = publicacionesError.message;
  } else {
    const idsPublicaciones = (publicaciones || []).map((p) => p.id);

    if (idsPublicaciones.length > 0) {
      const { data, error } = await supabase
        .from("solicitudes")
        .select(`
          id,
          cantidad_solicitada,
          mensaje,
          estado,
          fecha_solicitud,
          publicaciones (
            id,
            codigo,
            producto,
            descuento_pvp
          ),
          farmacias (
            id,
            nombre,
            localidad,
            provincia,
            email
          )
        `)
        .in("publicacion_id", idsPublicaciones)
        .order("fecha_solicitud", { ascending: false });

      if (error) {
        errorMensaje = error.message;
      } else {
        const raw = (data ?? []) as unknown as SolicitudRecibidaRaw[];

        solicitudes = raw.map((item) => {
          const pub = Array.isArray(item.publicaciones)
            ? item.publicaciones[0] ?? null
            : item.publicaciones;

          const far = Array.isArray(item.farmacias)
            ? item.farmacias[0] ?? null
            : item.farmacias;

          return {
            id: item.id,
            cantidad_solicitada: item.cantidad_solicitada,
            mensaje: item.mensaje,
            estado: item.estado,
            fecha_solicitud: item.fecha_solicitud,
            publicaciones: pub
              ? {
                  id: pub.id,
                  codigo: pub.codigo,
                  producto: pub.producto,
                  descuento_pvp: pub.descuento_pvp,
                }
              : null,
            farmacias: far
              ? {
                  id: far.id,
                  nombre: far.nombre,
                  localidad: far.localidad,
                  provincia: far.provincia,
                  email: far.email,
                }
              : null,
          };
        });
      }
    }
  }

  return (
    <AppShell
      farmaciaNombre={farmacia.nombre}
      titulo="Solicitudes recibidas"
      subtitulo={`Pedidos recibidos por ${farmacia.nombre}`}
      acciones={
        <>
          <Link href="/publicaciones" style={styles.buttonPrimary}>
            Mis publicaciones
          </Link>
          <Link href="/" style={styles.buttonSecondary}>
            Volver al panel
          </Link>
        </>
      }
    >
      {errorMensaje && (
        <div style={{ ...styles.error, marginBottom: "20px" }}>
          Error al cargar solicitudes: {errorMensaje}
        </div>
      )}

      {!errorMensaje && solicitudes.length === 0 && (
        <div style={styles.card}>Todavía no hay solicitudes recibidas.</div>
      )}

      {solicitudes.length > 0 && (
        <div style={{ display: "grid", gap: "16px" }}>
          {solicitudes.map((sol) => {
            const pub = sol.publicaciones;
            const farmaciaSolicitante = sol.farmacias;

            return (
              <div key={sol.id} style={styles.card}>
                <div style={{ overflowX: "auto" }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "separate",
                      borderSpacing: 0,
                      minWidth: "860px",
                    }}
                  >
                    <thead>
                      <tr>
                        <th style={{ ...thStyle, width: "180px" }}>Cod. barra</th>
                        <th style={{ ...thStyle, minWidth: "320px" }}>Descripción</th>
                        <th style={{ ...thStyle, textAlign: "right", width: "120px" }}>
                          Cantidad
                        </th>
                        <th style={{ ...thStyle, textAlign: "right", width: "120px" }}>
                          % Descto
                        </th>
                        <th style={{ ...thStyle, minWidth: "180px" }}>Farmacia</th>
                        <th style={{ ...thStyle, minWidth: "120px", textAlign: "center" }}>
                          Estado
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      <tr>
                        <td style={tdStyle}>{pub?.codigo || "-"}</td>
                        <td style={tdStyle}>{pub?.producto || "-"}</td>
                        <td style={{ ...tdStyle, textAlign: "right" }}>
                          {sol.cantidad_solicitada ?? "-"}
                        </td>
                        <td style={{ ...tdStyle, textAlign: "right" }}>
                          {formatearDescuento(pub?.descuento_pvp)}
                        </td>
                        <td style={tdStyle}>
                          {farmaciaSolicitante?.id ? (
                            <Link
                              href={`/farmacias/${farmaciaSolicitante.id}`}
                              style={farmaciaLinkStyle}
                            >
                              {farmaciaSolicitante.nombre}
                            </Link>
                          ) : (
                            farmaciaSolicitante?.nombre || "-"
                          )}
                        </td>
                        <td style={{ ...tdStyle, textAlign: "center" }}>
                          <span style={estadoChipStyle}>{sol.estado}</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {sol.mensaje && (
                  <div
                    style={{
                      ...styles.cardSoft,
                      marginTop: "16px",
                      marginBottom: "16px",
                    }}
                  >
                    <div style={metaLabelStyle}>Mensaje</div>
                    <div style={metaValueStyle}>{sol.mensaje}</div>
                  </div>
                )}

                <div
                  style={{
                    ...styles.cardSoft,
                    marginTop: sol.mensaje ? "0" : "16px",
                  }}
                >
                  <EstadoSolicitudActions
                    solicitudId={sol.id}
                    estadoActual={sol.estado}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}

function formatearDescuento(valor: number | null | undefined) {
  if (valor === null || valor === undefined) return "-";
  return String(Math.round(valor));
}

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "12px 12px",
  fontSize: "13px",
  color: "#aab4d6",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  borderBottom: "1px solid #2a3350",
};

const tdStyle: React.CSSProperties = {
  padding: "12px 12px",
  fontSize: "15px",
  color: "#ffffff",
  verticalAlign: "middle",
  borderBottom: "1px solid #24304f",
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

const metaLabelStyle: React.CSSProperties = {
  fontSize: "12px",
  color: "#aab4d6",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  marginBottom: "4px",
};

const metaValueStyle: React.CSSProperties = {
  fontSize: "14px",
  color: "#ffffff",
};

const farmaciaLinkStyle: React.CSSProperties = {
  color: "#9fb0e8",
  textDecoration: "none",
  fontWeight: 600,
};