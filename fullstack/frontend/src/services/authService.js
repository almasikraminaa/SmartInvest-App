import { supabase }
from "../lib/supabase";

export const registerUser =
async (
  name,
  email,
  password
) => {

  const {
    data,
    error
  } =
  await supabase.auth.signUp({

    email,
    password,

    options: {

      data: {
        full_name: name
      }
    }
  });

  if (error)
    throw error;

  return data;
};

export const loginUser =
async (
  email,
  password
) => {

  const {
    data,
    error
  } =
  await supabase.auth.signInWithPassword({

    email,
    password
  });

  if (error)
    throw error;

  return data;
};

export const logoutUser =
async () => {

  await supabase.auth.signOut();
};

export const getCurrentUser =
async () => {

  const {
    data
  } =
  await supabase.auth.getUser();

  return data.user;
};