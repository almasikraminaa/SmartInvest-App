import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";
import { supabase } from "../../../services/supabaseClient";
import {
  getProfile,
  createProfile,
  updateProfile,
} from "../../../services/profileService";

export default function AccountSettingsModal({
  isOpen,
  onClose,
  user,
  onProfileUpdate,
}) {
  const [activeTab, setActiveTab] = useState("profile");
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [authUser, setAuthUser] = useState(null);

  // Profile form state
  const [fullName, setFullName] = useState(user?.name || "");
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);

  // Password form state
  const [currentPassword, setCurrentPassword] = useState("");

  const [newPassword, setNewPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPw, setShowCurrentPw] = useState(false);

  const [showNewPw, setShowNewPw] = useState(false);

  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const [passwordError, setPasswordError] = useState("");
  // ======================
  // GET AUTH USER
  // ======================
  const isGoogleUser = authUser?.app_metadata?.providers?.includes("google");

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setAuthUser(user);

      if (!user) return;

      try {
        let profile = await getProfile(user.id);

        // jika profile belum ada
        if (!profile) {
          await createProfile(user);

          profile = await getProfile(user.id);
        }

        setFullName(profile?.full_name || "");

        setAvatarPreview(profile?.avatar_url || null);
      } catch (error) {
        console.error(error);
      }
    };

    loadUser();
  }, []);
  // Theme state
  const [theme, setTheme] = useState("light");

  const handleProfilePhoto = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    try {
      setIsSaving(true);

      const fileExt = file.name.split(".").pop();

      const fileName = `${Date.now()}.${fileExt}`;

      const filePath = `avatars/${fileName}`;

      // upload ke storage
      const { error: uploadError } = await supabase.storage
        .from("profile-images")
        .upload(filePath, file, {
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // ambil public URL
      const { data } = supabase.storage
        .from("profile-images")
        .getPublicUrl(filePath);

      const avatarUrl = data.publicUrl;

      // update auth metadata
      // simpan ke profiles table
      await updateProfile({
        userId: authUser.id,
        fullName,
        avatarUrl,
      });

      // update preview langsung
      setAvatarPreview(avatarUrl);
      

      toast.success("Foto profil berhasil diperbarui!");

      // update preview langsung
      setAvatarPreview(avatarUrl);

      // refresh auth user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setAuthUser(user);

      if (onProfileUpdate) {
        onProfileUpdate({
          name: fullName,
          avatar: avatarUrl,
        });
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };
  // ======================
  // HANDLE SAVE
  // ======================
  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaveError("");
    setPasswordError("");
    setIsSaving(true);

    try {
      if (activeTab === "profile") {
        if (!fullName.trim()) {
          toast.error("Nama lengkap wajib diisi.");

          setIsSaving(false);

          return;
        }

        await updateProfile({
          userId: authUser.id,

          fullName,

          avatarUrl: avatarPreview,
        });

        if (onProfileUpdate) {
          onProfileUpdate({
            name: fullName,

            avatar: avatarPreview,
          });
        }

        toast.success("Profil berhasil diperbarui!");

        onClose();
      } else if (activeTab === "security") {
        // validasi
        if (!newPassword) {
          setPasswordError("Kata sandi baru wajib diisi.");

          setIsSaving(false);
          return;
        }

        if (newPassword.length < 8) {
          setPasswordError("Password minimal 8 karakter.");

          setIsSaving(false);
          return;
        }

        if (newPassword !== confirmPassword) {
          setPasswordError("Konfirmasi password tidak cocok.");

          setIsSaving(false);
          return;
        }

        // GOOGLE USER
        if (isGoogleUser) {
          const { error } = await supabase.auth.updateUser({
            password: newPassword,
          });

          if (error) throw error;
        } else {
          // USER EMAIL BIASA
          if (!currentPassword) {
            setPasswordError("Kata sandi saat ini wajib diisi.");

            setIsSaving(false);
            return;
          }

          // cek password lama
          const { error: signInError } = await supabase.auth.signInWithPassword(
            {
              email: authUser?.email,

              password: currentPassword,
            },
          );

          if (signInError) {
            setPasswordError("Kata sandi saat ini salah.");

            setIsSaving(false);
            return;
          }

          // update password baru
          const { error } = await supabase.auth.updateUser({
            password: newPassword,
          });

          if (error) throw error;
        }

        setCurrentPassword("");

        setNewPassword("");

        setConfirmPassword("");
      } else if (activeTab === "preferences") {
        // --- JALUR API: Update Preferensi ---
        // TODO: Ganti mock dengan: await fetch('/api/profile/preferences', { method: 'PUT', body: { theme } })
        await mockDelay(500);
      }

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2500);
    } catch (err) {
      setSaveError(err.message || "Gagal menyimpan perubahan.");
    } finally {
      setIsSaving(false);
    }
  };

  const mockDelay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validasi tipe file
    if (!file.type.startsWith("image/")) {
      setSaveError("File harus berupa gambar (JPG/PNG).");
      return;
    }
    // Validasi ukuran (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setSaveError("Ukuran file maksimal 2MB.");
      return;
    }

    setSaveError("");
    setAvatarFile(file);
    const url = URL.createObjectURL(file);
    setAvatarPreview(url);
  };

  function getInitials(name) {
    if (!name || name === "N/A") return "U";
    return name
      .split(" ")
      .map((p) => p[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  if (!isOpen) return null;

  const tabs = [
    { id: "profile", label: "Profil", icon: UserIcon },
    { id: "security", label: "Keamanan", icon: ShieldIcon },
    { id: "preferences", label: "Preferensi", icon: PaletteIcon },
  ];

  const modal = (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-xl max-w-2xl w-full mx-4 max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
          <h2 className="text-xl font-bold text-slate-900">Pengaturan Akun</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body — two column layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left: Tab navigation */}
          <div className="w-48 bg-gray-50 border-r border-gray-100 py-4 px-3 shrink-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mb-1 ${activeTab === tab.id ? "bg-white text-smart-navy shadow-sm" : "text-gray-500 hover:bg-white/60"}`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Right: Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Tab: Profil */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 mb-4">
                    Profil Publik
                  </h3>

                  {/* Avatar */}
                  <div className="flex items-center gap-4 mb-6">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Avatar"
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-smart-navy text-white flex items-center justify-center text-lg font-bold">
                        {getInitials(fullName)}
                      </div>
                    )}
                    <div>
                      <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-sm font-medium transition">
                        Ubah Foto
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleProfilePhoto}
                        />
                      </label>
                      <p className="text-[10px] text-gray-400 mt-1">
                        JPG, PNG. Maks 2MB.
                      </p>
                    </div>
                  </div>

                  {/* Full Name */}
                  <div className="mb-4">
                    <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>

                  {/* Email (read-only) */}
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                      Email
                    </label>
                    <input
                      type="email"
                      value={user?.email || "user@email.com"}
                      readOnly
                      className="w-full border border-gray-100 rounded-lg px-4 py-2.5 text-sm text-gray-400 bg-gray-50 cursor-not-allowed"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">
                      Email tidak dapat diubah.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Keamanan */}
            {activeTab === "security" && (
              <div className="space-y-6">
                <h3 className="text-sm font-bold text-slate-800 mb-4">
                  Ubah Kata Sandi
                </h3>

                {/* Current Password */}
                {!isGoogleUser && (
                  <>
                    {/* Current Password */}
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                        Kata Sandi Saat Ini
                      </label>

                      <div className="relative">
                        <input
                          type={showCurrentPw ? "text" : "password"}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 pr-10"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* New Password */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                    Kata Sandi Baru
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPw ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 pr-10 text-sm text-gray-700 outline-none focus:border-blue-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPw(!showNewPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <EyeIcon show={showNewPw} />
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                    Konfirmasi Kata Sandi Baru
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPw ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 pr-10 text-sm text-gray-700 outline-none focus:border-blue-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPw(!showConfirmPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <EyeIcon show={showConfirmPw} />
                    </button>
                  </div>
                </div>

                {/* Password error */}
                {passwordError && (
                  <p className="text-xs text-red-500 font-medium bg-red-50 px-3 py-2 rounded-lg">
                    {passwordError}
                  </p>
                )}
              </div>
            )}

            {/* Tab: Preferensi */}
            {activeTab === "preferences" && (
              <div className="space-y-6">
                <h3 className="text-sm font-bold text-slate-800 mb-4">
                  Preferensi Tampilan
                </h3>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-3">
                    Tema Aplikasi
                  </label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setTheme("light")}
                      className={`flex-1 flex items-center gap-3 p-4 rounded-xl border-2 transition-colors ${theme === "light" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-yellow-500"
                        >
                          <circle cx="12" cy="12" r="5" />
                          <line x1="12" y1="1" x2="12" y2="3" />
                          <line x1="12" y1="21" x2="12" y2="23" />
                          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                          <line x1="1" y1="12" x2="3" y2="12" />
                          <line x1="21" y1="12" x2="23" y2="12" />
                          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                        </svg>
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-gray-800">
                          Light
                        </p>
                        <p className="text-[10px] text-gray-400">
                          Tema terang default
                        </p>
                      </div>
                    </button>
                    <button
                      onClick={() => setTheme("dark")}
                      className={`flex-1 flex items-center gap-3 p-4 rounded-xl border-2 transition-colors ${theme === "dark" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-blue-300"
                        >
                          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                        </svg>
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-gray-800">
                          Dark
                        </p>
                        <p className="text-[10px] text-gray-400">
                          Tema gelap (segera hadir)
                        </p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between shrink-0">
          {showSuccess && (
            <span className="text-xs text-green-600 font-medium flex items-center gap-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Profil berhasil diperbarui!
            </span>
          )}
          {saveError && !showSuccess && (
            <span className="text-xs text-red-500 font-medium">
              {saveError}
            </span>
          )}
          {!showSuccess && !saveError && <div />}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-70 flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <svg
                    className="animate-spin h-3.5 w-3.5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Menyimpan...
                </>
              ) : (
                "Simpan Perubahan"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

// Icons
function UserIcon({ className = "" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
function ShieldIcon({ className = "" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}
function PaletteIcon({ className = "" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="13.5" cy="6.5" r="2.5" />
      <circle cx="17.5" cy="10.5" r="2.5" />
      <circle cx="8.5" cy="7.5" r="2.5" />
      <circle cx="6.5" cy="12.5" r="2.5" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
    </svg>
  );
}
function EyeIcon({ show }) {
  if (show)
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </svg>
    );
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
