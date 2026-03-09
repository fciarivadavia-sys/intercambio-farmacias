import Link from "next/link";
import { createClient } from "../src/lib/supabase-server";
import { getFarmaciaActual } from "../src/lib/getFarmaciaActual";
import LogoutButton from "./components/LogoutButton";
import { styles } from "../src/lib/ui";

export default async function Home() {
  const { farmacia, user, error } = await getFarmaciaActual();

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
            <h1 style={styles.title}>Intercambio de Farmacias</h1>
            <p style={{ ...styles.subtitle, lineHeight: 1.8 }}>
              No hay una farmacia autenticada. Primero ingresá con tu cuenta.
            </p>

            {error && (
              <div
                style={{
                  ...styles.error,
                  marginTop: "16px",
                }}
              >
                {error}
              </div>
            )}

            <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
              <Link href="/login" style={styles.buttonPrimary}>
                Ir al login
              </Link>
              <Link href="/registro" style={styles.buttonSecondary}>
                Crear cuenta
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const supabase = await createClient();

  let totalPublicaciones = 0;
  let publicacionesActivas = 0;
  let publicacionesPausadas = 0;
  let publicacionesConcretadas = 0;

  let solicitudesPendientes = 0;
  let solicitudesAceptadas = 0;
  let solicitudesConcretadas = 0;
  let totalSolicitudesRecibidas = 0;
  let totalSolicitudesEnviadas = 0;

  const { data: publicaciones } = await supabase
    .from("publicaciones")
    .select("id, estado")
    .eq("farmacia_id", farmacia.id);

  if (publicaciones) {
    totalPublicaciones = publicaciones.length;
    publicacionesActivas = publicaciones.filter(
      (p) => p.estado === "activa"
    ).length;
    publicacionesPausadas = publicaciones.filter(
      (p) => p.estado === "pausada"
    ).length;
    publicacionesConcretadas = publicaciones.filter(
      (p) => p.estado === "concretada"
    ).length;

    const idsPublicaciones = publicaciones.map((p) => p.id);

    if (idsPublicaciones.length > 0) {
      const { data: solicitudesRecibidas } = await supabase
        .from("solicitudes")
        .select("estado")
        .in("publicacion_id", idsPublicaciones);

      if (solicitudesRecibidas) {
        totalSolicitudesRecibidas = solicitudesRecibidas.length;
        solicitudesPendientes = solicitudesRecibidas.filter(
          (s) => s.estado === "pendiente"
        ).length;
        solicitudesAceptadas = solicitudesRecibidas.filter(
          (s) => s.estado === "aceptada"
        ).length;
        solicitudesConcretadas = solicitudesRecibidas.filter(
          (s) => s.estado === "concretada"
        ).length;
      }
    }
  }

  const { data: solicitudesEnviadas } = await supabase
    .from("solicitudes")
    .select("id")
    .eq("farmacia_solicitante_id", farmacia.id);

  if (solicitudesEnviadas) {
    totalSolicitudesEnviadas = solicitudesEnviadas.length;
  }

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "20px",
            flexWrap: "wrap",
            marginBottom: "32px",
            paddingBottom: "18px",
            borderBottom: "1px solid #26304d",
          }}
        >
          <div>
            <h1 style={styles.title}>Intercambio de Farmacias</h1>
            <p style={styles.subtitle}>Panel inicial del proyecto</p>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <div style={styles.chip}>{farmacia.nombre}</div>
            <LogoutButton />
          </div>
        </header>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: "20px",
            marginBottom: "24px",
          }}
        >
          <div style={styles.card}>
            <h2 style={{ marginTop: 0, marginBottom: "12px", fontSize: "28px" }}>
              Bienvenido
            </h2>

            <p style={{ color: "#b7c2e6", fontSize: "17px", lineHeight: 1.6 }}>
              Ya estás trabajando con una farmacia autenticada de verdad.
            </p>

            <div
              style={{
                ...styles.cardSoft,
                marginTop: "20px",
              }}
            >
              <h3 style={{ marginTop: 0, marginBottom: "12px" }}>
                Datos de la farmacia
              </h3>

              <div style={{ lineHeight: 1.8 }}>
                <p style={{ margin: 0 }}>
                  <strong>Nombre:</strong> {farmacia.nombre}
                </p>
                <p style={{ margin: 0 }}>
                  <strong>Responsable:</strong> {farmacia.responsable || "-"}
                </p>
                <p style={{ margin: 0 }}>
                  <strong>Email:</strong> {farmacia.email}
                </p>
                <p style={{ margin: 0 }}>
                  <strong>Localidad:</strong> {farmacia.localidad || "-"}
                </p>
                <p style={{ margin: 0 }}>
                  <strong>Provincia:</strong> {farmacia.provincia || "-"}
                </p>
                <p style={{ margin: 0 }}>
                  <strong>Estado:</strong> {farmacia.estado}
                </p>
              </div>
            </div>
          </div>

          <div style={styles.card}>
            <h3 style={{ marginTop: 0, marginBottom: "16px" }}>Accesos rápidos</h3>

            <div style={{ display: "grid", gap: "12px" }}>
              <Link href="/publicaciones/nueva" style={styles.buttonPrimary}>
                Nueva publicación
              </Link>
              <Link href="/oportunidades" style={styles.buttonPrimary}>
                Ver oportunidades
              </Link>
              <Link href="/publicaciones" style={styles.buttonPrimary}>
                Mis publicaciones
              </Link>
              <Link href="/solicitudes/enviadas" style={styles.buttonPrimary}>
                Solicitudes enviadas
              </Link>
              <Link href="/solicitudes/recibidas" style={styles.buttonPrimary}>
                Solicitudes recibidas
              </Link>
            </div>
          </div>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <MetricCard
            title="Publicaciones activas"
            value={String(publicacionesActivas)}
          />
          <MetricCard
            title="Publicaciones pausadas"
            value={String(publicacionesPausadas)}
          />
          <MetricCard
            title="Publicaciones concretadas"
            value={String(publicacionesConcretadas)}
          />
          <MetricCard
            title="Total publicaciones"
            value={String(totalPublicaciones)}
          />
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <MetricCard
            title="Solicitudes pendientes"
            value={String(solicitudesPendientes)}
          />
          <MetricCard
            title="Solicitudes aceptadas"
            value={String(solicitudesAceptadas)}
          />
          <MetricCard
            title="Solicitudes concretadas"
            value={String(solicitudesConcretadas)}
          />
          <MetricCard
            title="Solicitudes enviadas"
            value={String(totalSolicitudesEnviadas)}
          />
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
          }}
        >
          <div style={styles.card}>
            <h3 style={{ marginTop: 0 }}>Resumen operativo</h3>
            <ul style={{ lineHeight: 1.9, color: "#c8d2f0", paddingLeft: "20px" }}>
              <li>Total de publicaciones: {totalPublicaciones}</li>
              <li>Solicitudes recibidas: {totalSolicitudesRecibidas}</li>
              <li>Solicitudes enviadas: {totalSolicitudesEnviadas}</li>
              <li>Solicitudes pendientes: {solicitudesPendientes}</li>
            </ul>
          </div>

          <div style={styles.card}>
            <h3 style={{ marginTop: 0 }}>Estado del proyecto</h3>
            <p style={{ color: "#c8d2f0", lineHeight: 1.8 }}>
              Ya estás usando la farmacia autenticada y no una demo fija. Ahora
              sí el sistema empieza a jugar en serio.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

function MetricCard({ title, value }: { title: string; value: string }) {
  return (
    <div style={styles.metricCard}>
      <p
        style={{
          margin: 0,
          color: "#aab4d6",
          fontSize: "13px",
          textTransform: "uppercase",
          letterSpacing: "0.04em",
        }}
      >
        {title}
      </p>

      <h3
        style={{
          margin: "14px 0 6px 0",
          fontSize: "38px",
          lineHeight: 1,
        }}
      >
        {value}
      </h3>

      <div
        style={{
          width: "56px",
          height: "4px",
          borderRadius: "999px",
          background: "#4f7cff",
          opacity: 0.9,
        }}
      />
    </div>
  );
}