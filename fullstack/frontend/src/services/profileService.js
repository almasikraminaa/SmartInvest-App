import { supabase } from "./supabaseClient";

// ======================
// GET PROFILE
// ======================
export const getProfile = async (userId) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  // kalau profile belum ada
  if (error && error.code !== "PGRST116") {
    throw error;
  }

  return data;
};

// ======================
// CREATE PROFILE
// ======================
export const createProfile = async (user) => {
  const { error } = await supabase.from("profiles").upsert({
    id: user.id,

    full_name:
      user?.user_metadata?.full_name || user?.user_metadata?.name || "User",

    avatar_url:
      user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null,
  });

  if (error) throw error;
};

// ======================
// UPDATE PROFILE
// ======================
export const updateProfile = async ({ userId, fullName, avatarUrl }) => {
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,

      avatar_url: avatarUrl,

      updated_at: new Date(),
    })
    .eq("id", userId);

  if (error) throw error;
};
