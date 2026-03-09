import Link from "next/link";
import { createClient } from "../../../src/lib/supabase-server";
import { getFarmaciaActual } from "../../../src/lib/getFarmaciaActual";
import AppShell from "../../components/AppShell";
import { styles } from "../../../src/lib/ui";

export default async function FarmaciaDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

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
            <h1 style={styles.title}>Ficha de farmacia</h1>
            <p style={{ ...styles.subtitle, lineHeight: 1.8 }}>
              Necesitás iniciar sesión para ver los datos de una farmacia.
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

  const { data: farmaciaDetalle, error } = await supabase
    .from("farmacias")
    .select("*")
    .eq("id", id)
    .single();

  return (
    <AppShell
      farmaciaNombre={farmacia.nombre}
      titulo="Ficha de farmacia"
      subtitulo="Datos completos de la farmacia seleccionada"
      acciones={
        <>
          <Link href="/solicitudes/recibidas" style={styles.buttonPrimary}>
            Volver a solicitudes
          </Link>
          <Link href="/" style={styles.buttonSecondary}>
            Panel
          </Link>
        </>
      }
    >
      {error || !farmaciaDetalle ? (
        <div style={styles.card}>No se pudo encontrar la farmacia.</div>
      ) : (
        <div style={styles.card}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
            }}
          >
            <Field label="Nombre" value={farmaciaDetalle.nombre || "-"} />
            <Field label="Responsable" value={farmaciaDetalle.responsable || "-"} />
            <Field label="Email" value={farmaciaDetalle.email || "-"} />
            <Field label="Teléfono" value={farmaciaDetalle.telefono || "-"} />
            <Field label="Localidad" value={farmaciaDetalle.localidad || "-"} />
            <Field label="Provincia" value={farmaciaDetalle.provincia || "-"} />
            <Field label="Dirección" value={farmaciaDetalle.direccion || "-"} />
            <Field label="Estado" value={farmaciaDetalle.estado || "-"} />
          </div>
        </div>
      )}
    </AppShell>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div style={styles.cardSoft}>
      <div
        style={{
          fontSize: "12px",
          color: "#aab4d6",
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          marginBottom: "6px",
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: "15px", color: "#ffffff" }}>{value}</div>
    </div>
  );
}