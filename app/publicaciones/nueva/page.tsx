"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "../../../src/lib/supabase-browser";
import AppShell from "../../components/AppShell";
import { styles } from "../../../src/lib/ui";

type FormData = {
  codigo: string;
  producto: string;
  lote: string;
  vencimiento: string;
  cantidad_disponible: string;
  precio_referencia: string;
  descuento_pvp: string;
  observaciones: string;
};

type FarmaciaActual = {
  id: string;
  nombre: string;
  email: string;
};

const initialForm: FormData = {
  codigo: "",
  producto: "",
  lote: "",
  vencimiento: "",
  cantidad_disponible: "",
  precio_referencia: "",
  descuento_pvp: "",
  observaciones: "",
};

export default function NuevaPublicacionPage() {
  const supabase = createClient();

  const [farmacia, setFarmacia] = useState<FarmaciaActual | null>(null);
  const [cargandoFarmacia, setCargandoFarmacia] = useState(true);

  const [form, setForm] = useState<FormData>(initialForm);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function cargarFarmaciaActual() {
      setCargandoFarmacia(true);
      setError("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError("No hay una sesión activa.");
        setCargandoFarmacia(false);
        return;
      }

      const { data: farmaciaData, error: farmaciaError } = await supabase
        .from("farmacias")
        .select("id, nombre, email")
        .eq("auth_user_id", user.id)
        .single();

      if (farmaciaError || !farmaciaData) {
        setError("No se pudo encontrar la farmacia autenticada.");
        setCargandoFarmacia(false);
        return;
      }

      setFarmacia(farmaciaData);
      setCargandoFarmacia(false);
    }

    cargarFarmaciaActual();
  }, [supabase]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMensaje("");
    setError("");

    if (!farmacia) {
      setError("No hay farmacia autenticada.");
      return;
    }

    if (!form.producto.trim()) {
      setError("El producto es obligatorio.");
      return;
    }

    if (!form.lote.trim()) {
      setError("El lote es obligatorio.");
      return;
    }

    if (!form.vencimiento) {
      setError("La fecha de vencimiento es obligatoria.");
      return;
    }

    const cantidad = Number(form.cantidad_disponible);
    if (!form.cantidad_disponible || Number.isNaN(cantidad) || cantidad <= 0) {
      setError("La cantidad disponible debe ser mayor a 0.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        farmacia_id: farmacia.id,
        producto: form.producto.trim(),
        codigo: form.codigo.trim() || null,
        lote: form.lote.trim(),
        vencimiento: form.vencimiento,
        cantidad_disponible: cantidad,
        precio_referencia: form.precio_referencia
          ? Number(form.precio_referencia)
          : null,
        descuento_pvp: form.descuento_pvp ? Number(form.descuento_pvp) : null,
        observaciones: form.observaciones.trim() || null,
      };

      const { error: insertError } = await supabase
        .from("publicaciones")
        .insert([payload]);

      if (insertError) {
        throw new Error(insertError.message);
      }

      setMensaje("Publicación guardada correctamente.");
      setForm(initialForm);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Ocurrió un error inesperado.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  if (cargandoFarmacia) {
    return (
      <main style={styles.page}>
        <div style={styles.container}>
          <div style={styles.card}>Cargando farmacia...</div>
        </div>
      </main>
    );
  }

  if (!farmacia) {
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
            <h1 style={styles.title}>Nueva publicación</h1>
            <p style={{ ...styles.subtitle, lineHeight: 1.8 }}>
              Necesitás una sesión válida para cargar publicaciones.
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
              <Link href="/" style={styles.buttonSecondary}>
                Volver al panel
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <AppShell
      farmaciaNombre={farmacia.nombre}
      titulo="Nueva publicación"
      subtitulo="Cargá un producto próximo a vencer o con sobrestock"
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
      <form onSubmit={handleSubmit} style={styles.card}>
        <div
          style={{
            ...styles.cardSoft,
            marginBottom: "18px",
            color: "#9fb0e8",
          }}
        >
          Farmacia activa: {farmacia.nombre}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "18px",
          }}
        >
          <Field
            label="Código de barras"
            name="codigo"
            value={form.codigo}
            onChange={handleChange}
            placeholder="Ej: 7791234567890"
          />

          <Field
            label="Producto *"
            name="producto"
            value={form.producto}
            onChange={handleChange}
            placeholder="Ej: Amoxicilina 500 mg x 16"
          />

          <Field
            label="Lote *"
            name="lote"
            value={form.lote}
            onChange={handleChange}
            placeholder="Ej: A24B15"
          />

          <Field
            label="Vencimiento *"
            name="vencimiento"
            type="date"
            value={form.vencimiento}
            onChange={handleChange}
          />

          <Field
            label="Cantidad disponible *"
            name="cantidad_disponible"
            type="number"
            value={form.cantidad_disponible}
            onChange={handleChange}
            placeholder="Ej: 5"
          />

          <Field
            label="Precio"
            name="precio_referencia"
            type="number"
            step="0.01"
            value={form.precio_referencia}
            onChange={handleChange}
            placeholder="Ej: 12500"
          />

          <Field
            label="% Descuento"
            name="descuento_pvp"
            type="number"
            step="0.01"
            value={form.descuento_pvp}
            onChange={handleChange}
            placeholder="Ej: 20"
          />
        </div>

        <div style={{ marginTop: "18px" }}>
          <label htmlFor="observaciones" style={styles.label}>
            Observaciones
          </label>
          <textarea
            id="observaciones"
            name="observaciones"
            value={form.observaciones}
            onChange={handleChange}
            placeholder="Escribí un comentario adicional"
            rows={5}
            style={textareaStyle}
          />
        </div>

        {error && (
          <div
            style={{
              ...styles.error,
              marginTop: "18px",
            }}
          >
            {error}
          </div>
        )}

        {mensaje && (
          <div
            style={{
              ...styles.success,
              marginTop: "18px",
            }}
          >
            {mensaje}
          </div>
        )}

        <div
          style={{
            display: "flex",
            gap: "12px",
            marginTop: "24px",
          }}
        >
          <button type="submit" disabled={loading} style={buttonPrimaryStyle}>
            {loading ? "Guardando..." : "Guardar publicación"}
          </button>

          <button
            type="button"
            onClick={() => {
              setForm(initialForm);
              setMensaje("");
              setError("");
            }}
            style={buttonSecondaryStyle}
          >
            Limpiar formulario
          </button>
        </div>
      </form>
    </AppShell>
  );
}

type FieldProps = {
  label: string;
  name: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  placeholder?: string;
  type?: string;
  step?: string;
};

function Field({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  step,
}: FieldProps) {
  return (
    <div>
      <label htmlFor={name} style={styles.label}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        step={step}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={styles.input}
      />
    </div>
  );
}

const textareaStyle: React.CSSProperties = {
  ...styles.input,
  resize: "vertical",
};

const buttonPrimaryStyle: React.CSSProperties = {
  ...styles.buttonPrimary,
  cursor: "pointer",
};

const buttonSecondaryStyle: React.CSSProperties = {
  ...styles.buttonSecondary,
  cursor: "pointer",
};