"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "../../src/lib/supabase-browser";
import { styles } from "../../src/lib/ui";

export default function RegistroPage() {
  const supabase = createClient();

  const [nombre, setNombre] = useState("");
  const [responsable, setResponsable] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [localidad, setLocalidad] = useState("");
  const [provincia, setProvincia] = useState("");
  const [direccion, setDireccion] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setOk("");

    if (!nombre.trim() || !email.trim() || !password.trim()) {
      setError("Nombre, email y contraseña son obligatorios.");
      return;
    }

    setCargando(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      if (authError) {
        throw new Error(authError.message);
      }

      const userId = authData.user?.id;

      if (!userId) {
        throw new Error("No se pudo crear el usuario en autenticación.");
      }

      const { error: insertError } = await supabase.from("farmacias").insert([
        {
          auth_user_id: userId,
          nombre: nombre.trim(),
          responsable: responsable.trim() || null,
          email: email.trim(),
          telefono: telefono.trim() || null,
          localidad: localidad.trim() || null,
          provincia: provincia.trim() || null,
          direccion: direccion.trim() || null,
          estado: "activa",
          fecha_alta: new Date().toISOString(),
        },
      ]);

      if (insertError) {
        throw new Error(insertError.message);
      }

      setOk("Farmacia registrada correctamente. Ya podés ingresar.");
      setNombre("");
      setResponsable("");
      setEmail("");
      setTelefono("");
      setLocalidad("");
      setProvincia("");
      setDireccion("");
      setPassword("");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Ocurrió un error inesperado.";
      setError(message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <div
          style={{
            ...styles.card,
            maxWidth: "760px",
            margin: "40px auto 0 auto",
          }}
        >
          <h1 style={styles.title}>Registro de farmacia</h1>
          <p style={styles.subtitle}>Creá una cuenta para operar en la plataforma</p>

          <form onSubmit={handleSubmit}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
              }}
            >
              <Field
                label="Nombre de la farmacia *"
                value={nombre}
                onChange={setNombre}
              />
              <Field
                label="Responsable"
                value={responsable}
                onChange={setResponsable}
              />
              <Field
                label="Email *"
                value={email}
                onChange={setEmail}
                type="email"
              />
              <Field
                label="Teléfono"
                value={telefono}
                onChange={setTelefono}
              />
              <Field
                label="Localidad"
                value={localidad}
                onChange={setLocalidad}
              />
              <Field
                label="Provincia"
                value={provincia}
                onChange={setProvincia}
              />
              <Field
                label="Dirección"
                value={direccion}
                onChange={setDireccion}
              />
              <Field
                label="Contraseña *"
                value={password}
                onChange={setPassword}
                type="password"
              />
            </div>

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

            {ok && (
              <div
                style={{
                  ...styles.success,
                  marginTop: "16px",
                }}
              >
                {ok}
              </div>
            )}

            <button type="submit" disabled={cargando} style={buttonPrimaryStyle}>
              {cargando ? "Registrando..." : "Registrar farmacia"}
            </button>
          </form>

          <div style={{ marginTop: "18px" }}>
            <Link href="/login" style={styles.buttonSecondary}>
              Ya tengo cuenta
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label style={styles.label}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={styles.input}
      />
    </div>
  );
}

const buttonPrimaryStyle: React.CSSProperties = {
  ...styles.buttonPrimary,
  width: "100%",
  cursor: "pointer",
  marginTop: "16px",
};