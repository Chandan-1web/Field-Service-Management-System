import {
  AlertTriangle,
  BadgeCheck,
  Building2,
  CalendarDays,
  Camera,
  CheckCircle2,
  Clock3,
  Edit3,
  Eye,
  EyeOff,
  KeyRound,
  Mail,
  Phone,
  RefreshCcw,
  Save,
  ShieldCheck,
  Trash2,
  UserRound,
  X,
} from "lucide-react";

import { useCallback, useEffect, useMemo, useState } from "react";

import toast from "react-hot-toast";

import {
  changeMyPassword,
  getMyProfile,
  removeMyProfilePhoto,
  updateMyProfile,
  uploadMyProfilePhoto,
} from "../../services/profileService";

const BACKEND_ORIGIN = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8081/api"
).replace(/\/api\/?$/, "");

function formatDateTime(value) {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function ProfileSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-64 rounded-[2rem] bg-slate-200" />

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.4fr]">
        <div className="h-[32rem] rounded-[2rem] bg-slate-200" />
        <div className="h-[32rem] rounded-[2rem] bg-slate-200" />
      </div>
    </div>
  );
}

function InfoCard({ title, value, icon: Icon }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-400">
        <Icon size={15} />
        {title}
      </div>

      <p className="mt-3 break-words font-bold text-slate-950">
        {value || "Not provided"}
      </p>
    </article>
  );
}

function ProfilePage() {
  const [profile, setProfile] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    department: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [photoError, setPhotoError] = useState(false);
  const [error, setError] = useState("");

  const applyProfile = useCallback((data) => {
    setProfile(data);

    setFormData({
      name: data?.name || "",
      email: data?.email || "",
      phoneNumber: data?.phoneNumber || "",
      department: data?.department || "",
    });

    setSelectedPhoto(null);
    setPhotoPreview("");
    setPhotoError(false);
  }, []);

  const fetchProfile = useCallback(
    async (showToast = false) => {
      try {
        setError("");

        if (showToast) {
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        }

        const data = await getMyProfile();

        applyProfile(data);

        if (showToast) {
          toast.success("Profile refreshed");
        }
      } catch (requestError) {
        const message =
          requestError.response?.data?.message ||
          requestError.response?.data?.error ||
          "Unable to load profile.";

        setError(message);

        if (showToast) {
          toast.error(message);
        }
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [applyProfile],
  );

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      void fetchProfile();
    }, 0);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [fetchProfile]);

  const initials = useMemo(() => {
    if (!profile?.name) {
      return "U";
    }

    return profile.name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word.charAt(0).toUpperCase())
      .join("");
  }, [profile]);

  const profilePhotoUrl = useMemo(() => {
    if (!profile?.profilePhoto) {
      return "";
    }

    if (
      profile.profilePhoto.startsWith("http://") ||
      profile.profilePhoto.startsWith("https://")
    ) {
      return profile.profilePhoto;
    }

    const photoPath = profile.profilePhoto.startsWith("/")
      ? profile.profilePhoto
      : `/${profile.profilePhoto}`;

    return `${BACKEND_ORIGIN}${photoPath}`;
  }, [profile]);

  const handleProfileChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const resetProfileForm = () => {
    if (!profile) {
      return;
    }

    setFormData({
      name: profile.name || "",
      email: profile.email || "",
      phoneNumber: profile.phoneNumber || "",
      department: profile.department || "",
    });

    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }

    setSelectedPhoto(null);
    setPhotoPreview("");
    setPhotoError(false);
  };

  const handleCancelEdit = () => {
    resetProfileForm();
    setIsEditing(false);
  };

  const validateProfile = () => {
    if (!formData.name.trim()) {
      toast.error("Full name is required.");
      return false;
    }

    if (!formData.email.trim()) {
      toast.error("Email is required.");
      return false;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(formData.email.trim())) {
      toast.error("Enter a valid email address.");
      return false;
    }

    const phone = formData.phoneNumber.trim();

    if (phone && !/^[0-9+\- ]{7,20}$/.test(phone)) {
      toast.error("Enter a valid phone number.");
      return false;
    }

    return true;
  };

  const handleSaveProfile = async (event) => {
    event.preventDefault();

    if (!validateProfile()) {
      return;
    }

    const oldEmail = profile?.email;

    try {
      setIsSaving(true);

      const updated = await updateMyProfile({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phoneNumber: formData.phoneNumber.trim(),
        department: formData.department.trim(),
      });

      applyProfile(updated);

      window.dispatchEvent(new Event("profile-updated"));
      setIsEditing(false);

      const emailChanged =
        oldEmail && oldEmail.toLowerCase() !== updated.email.toLowerCase();

      if (emailChanged) {
        toast.success(
          "Profile updated. Please sign in again using your new email.",
        );

        window.setTimeout(() => {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("user");
          window.location.href = "/login";
        }, 1500);

        return;
      }

      toast.success("Profile updated successfully");
    } catch (requestError) {
      const message =
        requestError.response?.data?.message ||
        requestError.response?.data?.error ||
        "Unable to update profile.";

      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhotoSelect = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG, PNG and WEBP images are allowed.");
      event.target.value = "";
      return;
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      toast.error("Profile photo must be smaller than 5 MB.");
      event.target.value = "";
      return;
    }

    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }

    const preview = URL.createObjectURL(file);

    setSelectedPhoto(file);
    setPhotoPreview(preview);
    setPhotoError(false);
  };

  const handleUploadPhoto = async () => {
    if (!selectedPhoto) {
      toast.error("Please choose a photo first.");
      return;
    }

    try {
      setIsUploadingPhoto(true);

      const updated = await uploadMyProfilePhoto(selectedPhoto);

      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }

      applyProfile(updated);

      window.dispatchEvent(new Event("profile-updated"));

      toast.success("Profile photo updated successfully");
    } catch (requestError) {
      const message =
        requestError.response?.data?.message ||
        requestError.response?.data?.error ||
        "Unable to upload profile photo.";

      toast.error(message);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = async () => {
    try {
      setIsUploadingPhoto(true);

      const updated = await removeMyProfilePhoto();

      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }

      applyProfile(updated);

      window.dispatchEvent(new Event("profile-updated"));

      toast.success("Profile photo removed successfully");
    } catch (requestError) {
      const message =
        requestError.response?.data?.message ||
        requestError.response?.data?.error ||
        "Unable to remove profile photo.";

      toast.error(message);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;

    setPasswordData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleChangePassword = async (event) => {
    event.preventDefault();

    if (!passwordData.currentPassword) {
      toast.error("Enter your current password.");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error("New password must contain at least 8 characters.");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New password and confirm password do not match.");
      return;
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      toast.error("New password must be different from your current password.");
      return;
    }

    try {
      setIsChangingPassword(true);

      await changeMyPassword(passwordData);

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);

      toast.success("Password changed successfully");
    } catch (requestError) {
      const message =
        requestError.response?.data?.message ||
        requestError.response?.data?.error ||
        "Unable to change password.";

      toast.error(message);
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (!profile || error) {
    return (
      <section className="flex min-h-[70vh] items-center justify-center">
        <div className="max-w-lg rounded-[2rem] border border-red-200 bg-white p-8 text-center shadow-xl shadow-red-100/50">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <AlertTriangle size={26} />
          </div>

          <h1 className="mt-5 text-2xl font-black text-slate-950">
            Profile could not be loaded
          </h1>

          <p className="mt-3 leading-7 text-slate-500">{error}</p>

          <button
            type="button"
            onClick={() => fetchProfile()}
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 font-bold text-white transition hover:bg-violet-700"
          >
            <RefreshCcw size={18} />
            Try again
          </button>
        </div>
      </section>
    );
  }

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-6 text-white shadow-2xl shadow-slate-300/40 sm:p-8">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-violet-600/25 blur-3xl" />
        <div className="absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-sky-500/20 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-violet-200">
              <ShieldCheck size={16} />
              Account workspace
            </div>

            <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
              My profile
            </h1>

            <p className="mt-3 max-w-2xl leading-7 text-slate-400">
              Manage your personal information, profile picture, account details
              and login security.
            </p>
          </div>

          <button
            type="button"
            onClick={() => fetchProfile(true)}
            disabled={isRefreshing}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-bold text-white transition hover:bg-white/10 disabled:opacity-50"
          >
            <RefreshCcw
              size={18}
              className={isRefreshing ? "animate-spin" : ""}
            />
            Refresh profile
          </button>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.78fr_1.45fr]">
        <div className="space-y-6">
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
            <div className="h-28 bg-gradient-to-r from-violet-600 via-indigo-600 to-sky-500" />

            <div className="-mt-14 px-6 pb-7">
              <div className="relative inline-flex">
                <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-[2rem] border-4 border-white bg-slate-950 text-3xl font-black text-white shadow-xl">
                  {profilePhotoUrl && !photoError ? (
                    <img
                      src={profilePhotoUrl}
                      alt={profile.name}
                      onError={() => setPhotoError(true)}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    initials
                  )}
                </div>
              </div>

              <h2 className="mt-5 text-2xl font-black text-slate-950">
                {profile.name}
              </h2>

              <p className="mt-1 text-sm font-semibold text-slate-500">
                {profile.email}
              </p>

              <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-violet-100 px-4 py-2 text-sm font-bold text-violet-700">
                <BadgeCheck size={16} />
                {profile.role}
              </div>

              <div className="mt-6 space-y-3 border-t border-slate-100 pt-5">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Phone size={17} className="text-violet-600" />
                  {profile.phoneNumber || "Phone number not added"}
                </div>

                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Building2 size={17} className="text-violet-600" />
                  {profile.department || "Department not added"}
                </div>

                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Mail size={17} className="text-violet-600" />
                  {profile.email}
                </div>
              </div>
            </div>
          </article>

          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-violet-600">
              Account information
            </p>

            <h3 className="mt-2 text-xl font-black text-slate-950">
              Account details
            </h3>

            <div className="mt-5 grid gap-3">
              <InfoCard
                title="User ID"
                value={`#${profile.id}`}
                icon={UserRound}
              />

              <InfoCard
                title="Account Created"
                value={formatDateTime(profile.createdAt)}
                icon={CalendarDays}
              />

              <InfoCard
                title="Last Login"
                value={formatDateTime(profile.lastLogin)}
                icon={Clock3}
              />

              <InfoCard
                title="Account Role"
                value={profile.role}
                icon={ShieldCheck}
              />
            </div>
          </article>
        </div>

        <div className="space-y-6">
          <article className="rounded-[2rem] border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-200 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-violet-600">
                  Personal information
                </p>

                <h2 className="mt-2 text-2xl font-black text-slate-950">
                  Profile information
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Update your account, contact information and profile picture.
                </p>
              </div>

              {!isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 font-bold text-white transition hover:bg-violet-700"
                >
                  <Edit3 size={17} />
                  Edit profile
                </button>
              )}
            </div>

            <form onSubmit={handleSaveProfile} className="p-6">
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="text-sm font-bold text-slate-700">
                    Full Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleProfileChange}
                    disabled={!isEditing}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100 disabled:cursor-not-allowed disabled:text-slate-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-700">
                    Email Address
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleProfileChange}
                    disabled={!isEditing}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100 disabled:cursor-not-allowed disabled:text-slate-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-700">
                    Phone Number
                  </label>

                  <input
                    type="text"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleProfileChange}
                    disabled={!isEditing}
                    placeholder="+91 9876543210"
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100 disabled:cursor-not-allowed disabled:text-slate-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-700">
                    Department
                  </label>

                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleProfileChange}
                    disabled={!isEditing}
                    placeholder="Field Operations"
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100 disabled:cursor-not-allowed disabled:text-slate-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-bold text-slate-700">
                    Profile Photo
                  </label>

                  <div className="mt-2 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                      <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-950 text-2xl font-black text-white">
                        {photoPreview ? (
                          <img
                            src={photoPreview}
                            alt="Selected preview"
                            className="h-full w-full object-cover"
                          />
                        ) : profilePhotoUrl && !photoError ? (
                          <img
                            src={profilePhotoUrl}
                            alt={profile.name}
                            onError={() => setPhotoError(true)}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          initials
                        )}
                      </div>

                      <div className="flex-1">
                        <p className="font-bold text-slate-900">
                          Choose your profile picture
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          JPG, PNG or WEBP. Maximum file size 5 MB.
                        </p>

                        <div className="mt-4 flex flex-wrap gap-3">
                          <label
                            className={`inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-violet-300 hover:text-violet-700 ${
                              !isEditing ? "pointer-events-none opacity-50" : ""
                            }`}
                          >
                            <Camera size={17} />
                            Choose Photo
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp"
                              onChange={handlePhotoSelect}
                              disabled={!isEditing}
                              className="hidden"
                            />
                          </label>

                          {selectedPhoto && (
                            <button
                              type="button"
                              onClick={handleUploadPhoto}
                              disabled={isUploadingPhoto}
                              className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-violet-700 disabled:opacity-50"
                            >
                              <Save size={17} />
                              {isUploadingPhoto
                                ? "Uploading..."
                                : "Upload Photo"}
                            </button>
                          )}

                          {profile.profilePhoto && (
                            <button
                              type="button"
                              onClick={handleRemovePhoto}
                              disabled={!isEditing || isUploadingPhoto}
                              className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                            >
                              <Trash2 size={17} />
                              Remove Photo
                            </button>
                          )}
                        </div>

                        {selectedPhoto && (
                          <p className="mt-3 text-xs font-semibold text-violet-600">
                            Selected: {selectedPhoto.name}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    disabled={isSaving || isUploadingPhoto}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-5 py-3 font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                  >
                    <X size={17} />
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSaving || isUploadingPhoto}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-violet-600 px-5 py-3 font-bold text-white transition hover:bg-violet-700 disabled:opacity-50"
                  >
                    <Save size={17} />
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              )}
            </form>
          </article>

          <article className="rounded-[2rem] border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                  <KeyRound size={21} />
                </div>

                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.16em] text-violet-600">
                    Account security
                  </p>

                  <h2 className="mt-1 text-2xl font-black text-slate-950">
                    Change password
                  </h2>
                </div>
              </div>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-5 p-6">
              <div>
                <label className="text-sm font-bold text-slate-700">
                  Current Password
                </label>

                <div className="mt-2 flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 focus-within:border-violet-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-violet-100">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter current password"
                    className="w-full bg-transparent py-3 outline-none"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowCurrentPassword((current) => !current)
                    }
                    className="text-slate-400 hover:text-violet-600"
                  >
                    {showCurrentPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="text-sm font-bold text-slate-700">
                    New Password
                  </label>

                  <div className="mt-2 flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 focus-within:border-violet-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-violet-100">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      placeholder="Minimum 8 characters"
                      className="w-full bg-transparent py-3 outline-none"
                    />

                    <button
                      type="button"
                      onClick={() => setShowNewPassword((current) => !current)}
                      className="text-slate-400 hover:text-violet-600"
                    >
                      {showNewPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-700">
                    Confirm Password
                  </label>

                  <div className="mt-2 flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 focus-within:border-violet-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-violet-100">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      placeholder="Repeat new password"
                      className="w-full bg-transparent py-3 outline-none"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword((current) => !current)
                      }
                      className="text-slate-400 hover:text-violet-600"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                <div className="flex gap-3">
                  <CheckCircle2
                    size={18}
                    className="mt-0.5 shrink-0 text-emerald-600"
                  />

                  <p className="text-sm leading-6 text-emerald-800">
                    Use at least 8 characters and choose a password different
                    from your current password.
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-6 py-3 font-bold text-white transition hover:bg-violet-700 disabled:opacity-50"
                >
                  <KeyRound size={17} />
                  {isChangingPassword ? "Changing..." : "Change Password"}
                </button>
              </div>
            </form>
          </article>
        </div>
      </section>
    </div>
  );
}

export default ProfilePage;
