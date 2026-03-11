import Link from "next/link";
import { createClient } from "../../src/lib/supabase-server";
import { getFarmaciaActual } from "../../src/lib/getFarmaciaActual";
import AppShell from "../components/AppShell";
import { styles } from "../../src/lib/ui";

type SearchParams = {
  producto?: string;
  estado?: string;
};

export default async function OportunidadesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const producto = params?.producto?.trim() || "";
  const estado = params?.estado?.trim() || "activa";

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
            <h1 style={styles.title}>Oportunidades</h1>
            <p style={{ ...styles.subtitle, lineHeight: 1.8 }}>
              Necesitás iniciar sesión para ver las oportunidades disponibles.
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

  let query = supabase
    .from("publicaciones")
    .select(`
      id,
      producto,
      codigo,
      cantidad_disponible,
      descuento_pvp,
      estado,
      farmacia_id,
      farmacias (
        id,
        nombre,
        localidad,
        provincia
      )
    `)
    .neq("farmacia_id", farmacia.id)
    .order("producto", { ascending: true });

  if (estado) {
    query = query.eq("estado", estado);
  }

  if (producto) {
    query = query.ilike("producto", `%${producto}%`);
  }

  const { data: publicaciones, error } = await query;

  return (
    <AppShell
      farmaciaNombre={farmacia.nombre}
      titulo="Oportunidades"
      subtitulo="Publicaciones disponibles de otras farmacias"
      acciones={
        <>
          <Link href="/publicaciones/nueva" style={styles.buttonPrimary}>
            Nueva publicación
          </Link>
          <Link href="/" style={styles.buttonSecondary}>
            Volver al panel
          </Link>
        </>
      }
    >
      <div
        style={{
          display: "grid",
          gap: "16px",
          height: "calc(100vh - 220px)",
          minHeight: "520px",
        }}
      >
        <form
          method="GET"
          style={{
            ...styles.card,
            padding: "14px 18px",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 180px auto",
              gap: "10px",
              alignItems: "end",
            }}
          >
            <div>
              <label style={compactLabelStyle}>Producto</label>
              <input
                type="text"
                name="producto"
                defaultValue={producto}
                placeholder="Ej: ibuprofeno"
                style={compactInputStyle}
              />
            </div>

            <div>
              <label style={compactLabelStyle}>Estado</label>
              <select name="estado" defaultValue={estado} style={compactInputStyle}>
                <option value="activa">Activa</option>
                <option value="pausada">Pausada</option>
                <option value="concretada">Concretada</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <button type="submit" style={compactPrimaryButtonStyle}>
                Filtrar
              </button>
              <Link href="/oportunidades" style={compactSecondaryButtonStyle}>
                Limpiar
              </Link>
            </div>
          </div>
        </form>

        {error && (
          <div style={{ ...styles.error }}>
            Error al cargar oportunidades: {error.message}
          </div>
        )}

        {!error && (!publicaciones || publicaciones.length === 0) && (
          <div style={styles.card}>
            No hay publicaciones de otras farmacias que coincidan con los filtros.
          </div>
        )}

        {publicaciones && publicaciones.length > 0 && (
          <div
            style={{
              ...styles.card,
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
              padding: 0,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                overflowY: "auto",
                overflowX: "auto",
                minHeight: 0,
                flex: 1,
              }}
            >
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
                    <th style={{ ...thStyle, minWidth: "360px" }}>Descripción</th>
                    <th style={{ ...thStyle, textAlign: "right", width: "110px" }}>
                      Cantidad
                    </th>
                    <th style={{ ...thStyle, textAlign: "right", width: "110px" }}>
                      % Descto
                    </th>
                    <th style={{ ...thStyle, minWidth: "180px" }}>Farmacia</th>
                    <th style={{ ...thStyle, textAlign: "center", width: "130px" }}>
                      Acción
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {publicaciones.map((pub) => {
                    const farmaciaPub = Array.isArray(pub.farmacias)
                      ? pub.farmacias[0]
                      : pub.farmacias;

                    return (
                      <tr key={pub.id}>
                        <td style={tdStyle}>{pub.codigo || "-"}</td>
                        <td style={tdStyle}>{pub.producto}</td>
                        <td style={{ ...tdStyle, textAlign: "right" }}>
                          {pub.cantidad_disponible ?? "-"}
                        </td>
                        <td style={{ ...tdStyle, textAlign: "right" }}>
                          {formatearDescuento(pub.descuento_pvp)}
                        </td>
                        <td style={tdStyle}>
                          {farmaciaPub?.id ? (
                            <Link href={`/farmacias/${farmaciaPub.id}`} style={farmaciaLinkStyle}>
                              {farmaciaPub.nombre}
                            </Link>
                          ) : (
                            farmaciaPub?.nombre || "-"
                          )}
                        </td>
                        <td style={{ ...tdStyle, textAlign: "center" }}>
                          <Link
                            href={`/oportunidades/${pub.id}/solicitar`}
                            style={actionLinkStyle}
                          >
                            Me interesa
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

function formatearDescuento(valor: number | null) {
  if (valor === null || valor === undefined) return "-";
  return String(Math.round(valor));
}

const thStyle: React.CSSProperties = {
  position: "sticky",
  top: 0,
  zIndex: 2,
  background: "#151b2e",
  textAlign: "left",
  padding: "10px 12px",
  fontSize: "13px",
  color: "#aab4d6",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  borderBottom: "1px solid #2a3350",
};

const tdStyle: React.CSSProperties = {
  padding: "10px 12px",
  fontSize: "15px",
  color: "#ffffff",
  borderBottom: "1px solid #24304f",
};

const compactLabelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: "4px",
  fontSize: "12px",
  color: "#c8d2f0",
  fontWeight: 600,
};

const compactInputStyle: React.CSSProperties = {
  ...styles.input,
  padding: "8px 12px",
  height: "40px",
};

const compactPrimaryButtonStyle: React.CSSProperties = {
  ...styles.buttonPrimary,
  height: "40px",
  padding: "0 14px",
  cursor: "pointer",
};

const compactSecondaryButtonStyle: React.CSSProperties = {
  ...styles.buttonSecondary,
  height: "40px",
  padding: "0 14px",
};

const actionLinkStyle: React.CSSProperties = {
  background: "#4f7cff",
  color: "#ffffff",
  borderRadius: "10px",
  padding: "8px 12px",
  fontSize: "13px",
  fontWeight: 600,
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: "96px",
};

const farmaciaLinkStyle: React.CSSProperties = {
  color: "#9fb0e8",
  textDecoration: "none",
  fontWeight: 600,
};