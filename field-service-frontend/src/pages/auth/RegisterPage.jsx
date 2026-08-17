import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import {
  Activity,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
  Phone,
  ShieldCheck,
  User,
  Wrench,
} from "lucide-react";

import { registerCustomer } from "../../services/authService";

function RegisterPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setFieldErrors((previous) => ({
      ...previous,
      [name]: "",
    }));
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      errors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Enter a valid email address";
    }

    if (!formData.phone.trim()) {
      errors.phone = "Mobile number is required";
    } else if (!/^[0-9]{10}$/.test(formData.phone.trim())) {
      errors.phone = "Enter a valid 10-digit mobile number";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 6) {
      errors.password = "Password must contain at least 6 characters";
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = "Confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await registerCustomer({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        password: formData.password,
      });

      toast.success("Customer account created successfully");

      navigate("/login", {
        replace: true,
      });
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data ||
        error.message ||
        "Unable to create your account.";

      toast.error(
        typeof message === "string"
          ? message
          : "Unable to create your account.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputWrapper = (fieldName) =>
    `flex items-center rounded-2xl border bg-slate-50 px-4 transition focus-within:bg-white focus-within:ring-4 ${
      fieldErrors[fieldName]
        ? "border-red-300 focus-within:border-red-400 focus-within:ring-red-100"
        : "border-slate-200 focus-within:border-violet-500 focus-within:ring-violet-100"
    }`;

  return (
    <main className="h-screen overflow-hidden bg-slate-950">
      <section className="grid h-screen overflow-hidden lg:grid-cols-[0.9fr_1.1fr]">
        {/* ================================================= */}
        {/* LEFT SIDE */}
        {/* ================================================= */}

        <div className="relative hidden overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950 p-8 lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-violet-600/30 blur-[120px]" />

          <div className="absolute -bottom-40 -right-24 h-[30rem] w-[30rem] rounded-full bg-indigo-500/20 blur-[120px]" />

          {/* LOGO */}

          <div className="relative z-10">
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="flex items-center gap-3"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-xl">
                <Activity size={22} />
              </div>

              <div className="text-left">
                <p className="text-lg font-black text-white">KEYSTONE</p>

                <p className="text-sm text-violet-200">
                  Field Service Platform
                </p>
              </div>
            </button>
          </div>

          {/* MAIN TEXT */}

          <div className="relative z-10 max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/10 px-4 py-2 text-sm font-semibold text-violet-200">
              <Wrench size={16} />
              Customer Service Portal
            </div>

            <h1 className="mt-4 text-4xl font-black leading-tight tracking-tight text-white xl:text-5xl">
              Get service support
              <span className="block bg-gradient-to-r from-violet-400 via-fuchsia-300 to-sky-300 bg-clip-text text-transparent">
                whenever you need it.
              </span>
            </h1>

            <p className="mt-4 text-base leading-7 text-slate-300 xl:text-lg">
              Create your customer account to request field service, register
              service locations and track your work orders.
            </p>

            <div className="mt-6 space-y-3">
              <Feature text="Create and track service requests" />

              <Feature text="Manage your registered service sites" />

              <Feature text="Follow technician and work-order progress" />

              <Feature text="Secure customer-only workspace" />
            </div>
          </div>

          {/* FOOTER */}

          <div className="relative z-10 flex items-center gap-2 text-sm text-slate-400">
            <ShieldCheck size={17} className="text-emerald-400" />
            Secure customer registration
          </div>
        </div>

        {/* ================================================= */}
        {/* RIGHT SIDE */}
        {/* ================================================= */}

        <div className="flex h-screen items-center justify-center overflow-hidden bg-white px-5 py-4 sm:px-8 lg:rounded-l-[3rem]">
          <div className="w-full max-w-xl">
            {/* MOBILE LOGO */}

            <div className="mb-4 flex items-center gap-3 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 text-white">
                <Activity size={20} />
              </div>

              <div>
                <p className="font-black text-slate-950">KEYSTONE</p>

                <p className="text-xs text-slate-500">
                  Customer Service Portal
                </p>
              </div>
            </div>

            {/* BACK */}

            <button
              type="button"
              onClick={() => navigate("/login")}
              className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-violet-700"
            >
              <ArrowLeft size={17} />
              Back to sign in
            </button>

            {/* HEADER */}

            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-violet-600">
                Customer registration
              </p>

              <h2 className="mt-1 text-3xl font-black tracking-tight text-slate-950">
                Create your account
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Register as a customer to request and track field service.
              </p>
            </div>

            {/* FORM */}

            <form onSubmit={handleSubmit} className="mt-5 space-y-3" noValidate>
              {/* NAME */}

              <div>
                <label className="mb-1 block text-sm font-bold text-slate-700">
                  Full name
                </label>

                <div className={inputWrapper("name")}>
                  <User size={18} className="shrink-0 text-slate-400" />

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    autoComplete="name"
                    className="w-full bg-transparent px-3 py-3 text-slate-900 outline-none placeholder:text-slate-400"
                  />
                </div>

                {fieldErrors.name && (
                  <p className="mt-1 text-xs font-medium text-red-500">
                    {fieldErrors.name}
                  </p>
                )}
              </div>

              {/* EMAIL + PHONE */}

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-bold text-slate-700">
                    Email address
                  </label>

                  <div className={inputWrapper("email")}>
                    <Mail size={18} className="shrink-0 text-slate-400" />

                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="name@example.com"
                      autoComplete="email"
                      className="w-full bg-transparent px-3 py-3 text-slate-900 outline-none placeholder:text-slate-400"
                    />
                  </div>

                  {fieldErrors.email && (
                    <p className="mt-1 text-xs font-medium text-red-500">
                      {fieldErrors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-sm font-bold text-slate-700">
                    Mobile number
                  </label>

                  <div className={inputWrapper("phone")}>
                    <Phone size={18} className="shrink-0 text-slate-400" />

                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="10-digit number"
                      autoComplete="tel"
                      maxLength={10}
                      className="w-full bg-transparent px-3 py-3 text-slate-900 outline-none placeholder:text-slate-400"
                    />
                  </div>

                  {fieldErrors.phone && (
                    <p className="mt-1 text-xs font-medium text-red-500">
                      {fieldErrors.phone}
                    </p>
                  )}
                </div>
              </div>

              {/* PASSWORD */}

              <div>
                <label className="mb-1 block text-sm font-bold text-slate-700">
                  Password
                </label>

                <div className={inputWrapper("password")}>
                  <LockKeyhole size={18} className="shrink-0 text-slate-400" />

                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Minimum 6 characters"
                    autoComplete="new-password"
                    className="w-full bg-transparent px-3 py-3 text-slate-900 outline-none placeholder:text-slate-400"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((previous) => !previous)}
                    className="text-slate-400 transition hover:text-violet-600"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {fieldErrors.password && (
                  <p className="mt-1 text-xs font-medium text-red-500">
                    {fieldErrors.password}
                  </p>
                )}
              </div>

              {/* CONFIRM PASSWORD */}

              <div>
                <label className="mb-1 block text-sm font-bold text-slate-700">
                  Confirm password
                </label>

                <div className={inputWrapper("confirmPassword")}>
                  <LockKeyhole size={18} className="shrink-0 text-slate-400" />

                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Enter password again"
                    autoComplete="new-password"
                    className="w-full bg-transparent px-3 py-3 text-slate-900 outline-none placeholder:text-slate-400"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword((previous) => !previous)
                    }
                    className="text-slate-400 transition hover:text-violet-600"
                    aria-label="Toggle confirm password visibility"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>

                {fieldErrors.confirmPassword && (
                  <p className="mt-1 text-xs font-medium text-red-500">
                    {fieldErrors.confirmPassword}
                  </p>
                )}
              </div>

              {/* CREATE ACCOUNT */}

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-700 px-6 py-3.5 font-bold text-white shadow-xl shadow-violet-200 transition hover:-translate-y-0.5 hover:shadow-2xl disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
              >
                {isSubmitting ? (
                  <>
                    <LoaderCircle size={19} className="animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create customer account
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            {/* EXISTING ACCOUNT */}

            <div className="mt-4 text-center">
              <span className="text-sm text-slate-500">
                Already have an account?{" "}
              </span>

              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-sm font-black text-violet-700 transition hover:text-violet-900"
              >
                Sign in
              </button>
            </div>

            {/* SECURITY */}

            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <div className="flex gap-3">
                <ShieldCheck
                  size={19}
                  className="mt-0.5 shrink-0 text-emerald-600"
                />

                <div>
                  <p className="text-sm font-bold text-slate-800">
                    Customer accounts only
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Manager, dispatcher and technician accounts are created
                    internally by authorized administrators.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function Feature({ text }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
        <CheckCircle2 size={17} />
      </div>

      <p className="text-sm font-semibold text-slate-200 xl:text-base">
        {text}
      </p>
    </div>
  );
}

export default RegisterPage;
