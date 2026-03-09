"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "../../src/lib/supabase-browser";
import { styles } from "../../src/lib/ui";

export default function LoginPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setOk("");

    if (!email.trim() || !password.trim()) {
      setError("Completá email y contraseña.");
      return;
    }

    setCargando(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setError(error.message);
      setCargando(false);
      return;
    }

    setOk("Ingreso correcto.");
    window.location.href = "/";
  }

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <div
          style={{
            ...styles.card,
            maxWidth: "460px",
            margin: "80px auto 0 auto",
          }}
        >
          <h1 style={styles.title}>Ingresar</h1>
          <p style={styles.subtitle}>Acceso para farmacias registradas</p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "16px" }}>
              <label style={styles.label}>Correo electrónico</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
                placeholder="tu@farmacia.com"
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={styles.label}>Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
                placeholder="********"
              />
            </div>

            {error && (
              <div
                style={{
                  ...styles.error,
                  marginBottom: "14px",
                }}
              >
                {error}
              </div>
            )}

            {ok && (
              <div
                style={{
                  ...styles.success,
                  marginBottom: "14px",
                }}
              >
                {ok}
              </div>
            )}

            <button type="submit" disabled={cargando} style={buttonPrimaryStyle}>
              {cargando ? "Ingresando..." : "Ingresar"}
            </button>
          </form>

          <div style={{ marginTop: "18px" }}>
            <Link href="/registro" style={styles.buttonSecondary}>
              Crear cuenta de farmacia
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

const buttonPrimaryStyle: React.CSSProperties = {
  ...styles.buttonPrimary,
  width: "100%",
  cursor: "pointer",
};