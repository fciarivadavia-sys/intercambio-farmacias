import LogoutButton from "./LogoutButton";
import { styles } from "../../src/lib/ui";

type Props = {
  farmaciaNombre: string;
  titulo: string;
  subtitulo?: string;
  children: React.ReactNode;
  acciones?: React.ReactNode;
};

export default function AppShell({
  farmaciaNombre,
  titulo,
  subtitulo,
  children,
  acciones,
}: Props) {
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
            <h1 style={styles.title}>{titulo}</h1>
            {subtitulo && <p style={styles.subtitle}>{subtitulo}</p>}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            {acciones}
            <div style={styles.chip}>{farmaciaNombre}</div>
            <LogoutButton />
          </div>
        </header>

        {children}
      </div>
    </main>
  );
}