import Link from "next/link";
import { createClient } from "../../../src/lib/supabase-server";
import { getFarmaciaActual } from "../../../src/lib/getFarmaciaActual";
import AppShell from "../../components/AppShell";
import { styles } from "../../../src/lib/ui";

type SolicitudRow = {
  id: string;
  cantidad_solicitada: number;
  mensaje: string | null;
  estado: string;
  fecha_solicitud: string;
  publicaciones: {
    codigo: string | null;
    producto: string;
    precio_referencia: number | null;
    descuento_pvp: number | null;
    farmacias: {
      id?: string;
      nombre: string;
      localidad: string | null;
      provincia: string | null;
    } | null;
  } | null;
};

type SolicitudRaw = {
  id: string;
  cantidad_solicitada: number;
  mensaje: string | null;
  estado: string;
  fecha_solicitud: string;
  publicaciones:
    | {
        codigo: string | null;
        producto: string;
        precio_referencia: number | null;
        descuento_pvp: number | null;
        farmacias:
          | {
              id?: string;
              nombre: string;
              localidad: string | null;
              provincia: string | null;
            }
          | {
              id?: string;
              nombre: string;
              localidad: string | null;
              provincia: string | null;
            }[]
          | null;
      }
    | {
        codigo: string | null;
        producto: string;
        precio_referencia: number | null;
        descuento_pvp: number | null;
        farmacias:
          | {
              id?: string;
              nombre: string;
              localidad: string | null;
              provincia: string | null;
            }
          | {
              id?: string;
              nombre: string;
              localidad: string | null;
              provincia: string | null;
            }[]
          | null;
      }[]
    | null;
};

export default async function SolicitudesEnviadasPage() {
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
            <h1 style={styles.title}>Solicitudes enviadas</h1>
            <p style={{ ...styles.subtitle, lineHeight: 1.8 }}>
              Necesitás iniciar sesión para ver tus solicitudes.
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

  let solicitudes: SolicitudRow[] = [];
  let errorMensaje = "";

  const { data, error } = await supabase
    .from("solicitudes")
    .select(`
      id,
      cantidad_solicitada,
      mensaje,
      estado,
      fecha_solicitud,
      publicaciones (
        codigo,
        producto,
        precio_referencia,
        descuento_pvp,
        farmacias (
          id,
          nombre,
          localidad,
          provincia
        )
      )
    `)
    .eq("farmacia_solicitante_id", farmacia.id)
    .order("fecha_solicitud", { ascending: false });

  if (error) {
    errorMensaje = error.message;
  } else {
    const raw = (data ?? []) as unknown as SolicitudRaw[];

    solicitudes = raw.map((item) => {
      const pub = Array.isArray(item.publicaciones)
        ? item.publicaciones[0] ?? null
        : item.publicaciones;

      const far = pub
        ? Array.isArray(pub.farmacias)
          ? pub.farmacias[0] ?? null
          : pub.farmacias
        : null;

      return {
        id: item.id,
        cantidad_solicitada: item.cantidad_solicitada,
        mensaje: item.mensaje,
        estado: item.estado,
        fecha_solicitud: item.fecha_solicitud,
        publicaciones: pub
          ? {
              codigo: pub.codigo,
              producto: pub.producto,
              precio_referencia: pub.precio_referencia,
              descuento_pvp: pub.descuento_pvp,
              farmacias: far
                ? {
                    id: far.id,
                    nombre: far.nombre,
                    localidad: far.localidad,
                    provincia: far.provincia,
                  }
                : null,
            }
          : null,
      };
    });
  }

  return (
    <AppShell
      farmaciaNombre={farmacia.nombre}
      titulo="Solicitudes enviadas"
      subtitulo={`Pedidos realizados por ${farmacia.nombre}`}
      acciones={
        <>
          <Link href="/oportunidades" style={styles.buttonPrimary}>
            Ver oportunidades
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
        <div style={styles.card}>Todavía no hay solicitudes enviadas.</div>
      )}

      {solicitudes.length > 0 && (
        <div style={styles.card}>
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
                  <th style={{ ...thStyle, width: "120px" }}>Cod. barra</th>
                  <th style={{ ...thStyle, minWidth: "320px" }}>Descripción</th>
                  <th style={{ ...thStyle, textAlign: "right", width: "110px" }}>
                    Cantidad
                  </th>
                  <th style={{ ...thStyle, textAlign: "right", width: "110px" }}>
                    % Descto
                  </th>
                  <th style={{ ...thStyle, textAlign: "right", width: "130px" }}>
                    Precio
                  </th>
                  <th style={{ ...thStyle, minWidth: "180px" }}>Farmacia</th>
                  <th style={{ ...thStyle, minWidth: "120px", textAlign: "center" }}>
                    Estado
                  </th>
                </tr>
              </thead>

              <tbody>
                {solicitudes.map((sol) => {
                  const pub = sol.publicaciones;
                  const far = pub?.farmacias ?? null;

                  return (
                    <tr
                      key={sol.id}
                      style={{
                        borderBottom: "1px solid #24304f",
                      }}
                    >
                      <td style={tdStyle}>{pub?.codigo || "-"}</td>
                      <td style={tdStyle}>{pub?.producto || "-"}</td>
                      <td style={{ ...tdStyle, textAlign: "right" }}>
                        {sol.cantidad_solicitada ?? "-"}
                      </td>
                      <td style={{ ...tdStyle, textAlign: "right" }}>
                        {pub?.descuento_pvp ?? "-"}
                      </td>
                      <td style={{ ...tdStyle, textAlign: "right" }}>
                        {formatearPrecio(pub?.precio_referencia ?? null)}
                      </td>
                      <td style={tdStyle}>
                        {far?.id ? (
                          <Link href={`/farmacias/${far.id}`} style={farmaciaLinkStyle}>
                            {far.nombre}
                          </Link>
                        ) : (
                          far?.nombre || "-"
                        )}
                      </td>
                      <td style={{ ...tdStyle, textAlign: "center" }}>
                        <span style={estadoChipStyle}>{sol.estado}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function formatearPrecio(valor: number | null) {
  if (valor === null || valor === undefined) return "-";

  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
  }).format(valor);
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

const farmaciaLinkStyle: React.CSSProperties = {
  color: "#9fb0e8",
  textDecoration: "none",
  fontWeight: 600,
};