import { createClient } from "./supabase-server";

export async function getFarmaciaActual() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      farmacia: null,
      user: null,
      error: userError?.message || "No hay usuario autenticado.",
    };
  }

  const { data: farmacia, error: farmaciaError } = await supabase
    .from("farmacias")
    .select("*")
    .eq("auth_user_id", user.id)
    .single();

  return {
    farmacia: farmacia || null,
    user,
    error: farmaciaError?.message || null,
  };
}