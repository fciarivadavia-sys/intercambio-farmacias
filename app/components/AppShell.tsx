import LogoutButton from "./LogoutButton";
import { styles } from "../../src/lib/ui";

export default function AppShell({
  farmaciaNombre,
  titulo,
  subtitulo,
  acciones,
  children,
}: {
  farmaciaNombre: string;
  titulo: string;
  subtitulo?: string;
  acciones?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <main
      style={{
        ...styles.page,
        minHeight: "100vh",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          ...styles.container,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "20px",
            flexWrap: "wrap",
            marginBottom: "20px",
            paddingBottom: "16px",
            borderBottom: "1px solid #26304d",
            flexShrink: 0,
          }}
        >
          <div>
            <h1 style={styles.title}>{titulo}</h1>
            {subtitulo ? <p style={styles.subtitle}>{subtitulo}</p> : null}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              flexWrap: "wrap",
              justifyContent: "flex-end",
            }}
          >
            {acciones}
            <div style={styles.chip}>{farmaciaNombre}</div>
            <LogoutButton />
          </div>
        </header>

        <section
          style={{
            flex: 1,
            minHeight: 0,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {children}
        </section>
      </div>
    </main>
  );
}