import type { CSSProperties } from "react";

export const colors = {
  bg: "#0b1020",
  panel: "#151b2e",
  panelSoft: "#0f1528",
  border: "#2a3350",
  borderSoft: "#24304f",
  text: "#ffffff",
  textSoft: "#c8d2f0",
  textMuted: "#aab4d6",
  primary: "#4f7cff",
  primaryHover: "#6a90ff",
  dangerBg: "#3a1010",
  dangerText: "#ffb9b9",
  successBg: "#10321c",
  successText: "#b6f2c8",
};

export const styles = {
  page: {
    minHeight: "100vh",
    background: `
      radial-gradient(circle at top left, rgba(79,124,255,0.16), transparent 28%),
      radial-gradient(circle at top right, rgba(123,92,255,0.10), transparent 24%),
      ${colors.bg}
    `,
    color: colors.text,
    fontFamily: "Arial, sans-serif",
    padding: "32px",
  } satisfies CSSProperties,

  container: {
    maxWidth: "1100px",
    margin: "0 auto",
  } satisfies CSSProperties,

  card: {
    background: colors.panel,
    border: `1px solid ${colors.border}`,
    borderRadius: "20px",
    padding: "24px",
    boxShadow: "0 14px 40px rgba(0,0,0,0.28)",
  } satisfies CSSProperties,

  cardSoft: {
    background: colors.panelSoft,
    border: `1px solid ${colors.borderSoft}`,
    borderRadius: "14px",
    padding: "16px",
  } satisfies CSSProperties,

  metricCard: {
    background: `
      linear-gradient(180deg, rgba(79,124,255,0.10) 0%, rgba(21,27,46,1) 34%),
      ${colors.panel}
    `,
    border: `1px solid ${colors.border}`,
    borderRadius: "20px",
    padding: "20px",
    boxShadow: "0 12px 30px rgba(0,0,0,0.22)",
  } satisfies CSSProperties,

  title: {
    margin: 0,
    fontSize: "34px",
    letterSpacing: "-0.02em",
  } satisfies CSSProperties,

  subtitle: {
    margin: "8px 0 0 0",
    color: colors.textMuted,
    fontSize: "15px",
  } satisfies CSSProperties,

  buttonPrimary: {
    background: colors.primary,
    color: colors.text,
    border: "none",
    borderRadius: "12px",
    padding: "12px 16px",
    fontSize: "14px",
    fontWeight: 600,
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 8px 22px rgba(79,124,255,0.28)",
  } satisfies CSSProperties,

  buttonSecondary: {
    background: colors.panel,
    color: colors.text,
    border: `1px solid ${colors.border}`,
    borderRadius: "12px",
    padding: "12px 16px",
    fontSize: "14px",
    fontWeight: 500,
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  } satisfies CSSProperties,

  chip: {
    background: colors.panel,
    border: `1px solid ${colors.border}`,
    borderRadius: "12px",
    padding: "10px 14px",
    fontSize: "14px",
    color: "#dbe3ff",
    whiteSpace: "nowrap",
  } satisfies CSSProperties,

  input: {
    width: "100%",
    background: colors.panelSoft,
    color: colors.text,
    border: `1px solid ${colors.border}`,
    borderRadius: "12px",
    padding: "12px 14px",
    fontSize: "15px",
    outline: "none",
  } satisfies CSSProperties,

  label: {
    display: "block",
    marginBottom: "8px",
    fontSize: "13px",
    color: colors.textSoft,
    fontWeight: 600,
  } satisfies CSSProperties,

  error: {
    background: colors.dangerBg,
    color: colors.dangerText,
    padding: "14px",
    borderRadius: "12px",
  } satisfies CSSProperties,

  success: {
    background: colors.successBg,
    color: colors.successText,
    padding: "14px",
    borderRadius: "12px",
  } satisfies CSSProperties,
};