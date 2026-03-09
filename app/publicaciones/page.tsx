import Link from "next/link";
import { createClient } from "../../src/lib/supabase-server";
import { getFarmaciaActual } from "../../src/lib/getFarmaciaActual";
import AppShell from "../components/AppShell";
import { styles } from "../../src/lib/ui";

type SearchParams = {
  producto?: string;
  laboratorio?: string;
  estado?: string;
};

export default async function PublicacionesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const producto = params?.producto?.trim() || "";
  const laboratorio = params?.laboratorio?.trim() || "";
  const estado = params?.estado?.trim() || "";

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
            <h1 style={styles.title}>Mis publicaciones</h1>
            <p style={{ ...styles.subtitle, lineHeight: 1.8 }}>
              Necesitás iniciar sesión para ver tus publicaciones.
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

  let publicaciones = null;
  let error: { message: string } | null = null;

  let query = supabase
    .from("publicaciones")
    .select("*")
    .eq("farmacia_id", farmacia.id)
    .order("created_at", { ascending: false });

  if (producto) {
    query = query.ilike("producto", `%${producto}%`);
  }

  if (laboratorio) {
    query = query.ilike("laboratorio", `%${laboratorio}%`);
  }

  if (estado) {
    query = query.eq("estado", estado);
  }

  const result = await query;
  publicaciones = result.data;
  error = result.error;

  return (
    <AppShell
      farmaciaNombre={farmacia.nombre}
      titulo="Mis publicaciones"
      subtitulo={`Productos cargados por ${farmacia.nombre}`}
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
      <form
        method="GET"
        style={{
          ...styles.card,
          marginBottom: "24px",
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: "16px" }}>Filtros</h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr auto",
            gap: "12px",
            alignItems: "end",
          }}
        >
          <div>
            <label style={styles.label}>Producto</label>
            <input
              type="text"
              name="producto"
              defaultValue={producto}
              placeholder="Ej: ibuprofeno"
              style={styles.input}
            />
          </div>

          <div>
            <label style={styles.label}>Laboratorio</label>
            <input
              type="text"
              name="laboratorio"
              defaultValue={laboratorio}
              placeholder="Ej: Bayer"
              style={styles.input}
            />
          </div>

          <div>
            <label style={styles.label}>Estado</label>
            <select name="estado" defaultValue={estado} style={styles.input}>
              <option value="">Todos</option>
              <option value="activa">Activa</option>
              <option value="pausada">Pausada</option>
              <option value="concretada">Concretada</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button type="submit" style={buttonPrimaryStyle}>
              Filtrar
            </button>
            <Link href="/publicaciones" style={styles.buttonSecondary}>
              Limpiar
            </Link>
          </div>
        </div>
      </form>

      {error && (
        <div style={{ ...styles.error, marginBottom: "20px" }}>
          {error.message}
        </div>
      )}

      {!error && (!publicaciones || publicaciones.length === 0) && (
        <div style={styles.card}>
          No hay publicaciones que coincidan con los filtros.
        </div>
      )}

      {publicaciones && publicaciones.length > 0 && (
        <div style={styles.card}>
          <div
            style={{
              overflowX: "auto",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: "760px",
              }}
            >
              <thead>
                <tr
                  style={{
                    borderBottom: "1px solid #2a3350",
                  }}
                >
                  <th style={thStyle}>Cod. barra</th>
                  <th style={thStyle}>Descripción</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>Cantidad</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>% Descto</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>Precio</th>
                </tr>
              </thead>

              <tbody>
                {publicaciones.map((pub) => (
                  <tr
                    key={pub.id}
                    style={{
                      borderBottom: "1px solid #24304f",
                    }}
                  >
                    <td style={tdStyle}>{pub.codigo || "-"}</td>
                    <td style={tdStyle}>{pub.producto}</td>
                    <td style={{ ...tdStyle, textAlign: "right" }}>
                      {pub.cantidad_disponible ?? "-"}
                    </td>
                    <td style={{ ...tdStyle, textAlign: "right" }}>
                      {pub.descuento_pvp ?? "-"}
                    </td>
                    <td style={{ ...tdStyle, textAlign: "right" }}>
                      {formatearPrecio(pub.precio_referencia)}
                    </td>
                  </tr>
                ))}
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

const buttonPrimaryStyle: React.CSSProperties = {
  ...styles.buttonPrimary,
  cursor: "pointer",
};