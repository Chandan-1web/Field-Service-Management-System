import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Activity,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Users,
  Wrench,
} from "lucide-react";

import { loginUser } from "../../services/authService";
import { useAuth } from "../../hooks/useAuth";
import { decodeToken } from "../../utils/decodeToken";

const roleBenefits = [
  {
    icon: BarChart3,
    title: "Operational visibility",
    description: "Track work orders, SLA risk and team performance.",
  },
  {
    icon: Wrench,
    title: "Complete service workflow",
    description: "Manage jobs from request through final close-out.",
  },
  {
    icon: Users,
    title: "Role-based workspace",
    description: "Dedicated experiences for every operational role.",
  },
];

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    setFieldErrors((previousErrors) => ({
      ...previousErrors,
      [name]: "",
    }));
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.email.trim()) {
      errors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Enter a valid email address";
    }

    if (!formData.password) {
      errors.password = "Password is required";
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
      const response = await loginUser(formData);
      const decodedToken = decodeToken(response.token);

      if (!decodedToken?.sub) {
        throw new Error("The authentication token is invalid");
      }

      const authenticatedUser = {
        email: decodedToken.sub,
        role: response.role || decodedToken.role,
        name: decodedToken.sub.split("@")[0],
      };

      login({
        token: response.token,
        user: authenticatedUser,
      });

      toast.success("Welcome to KEYSTONE");

      navigate("/dashboard", {
        replace: true,
      });
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Login failed. Check your credentials.";

      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative h-screen overflow-hidden bg-slate-950">
      <div className="absolute -left-40 -top-40 h-[28rem] w-[28rem] rounded-full bg-violet-600/30 blur-[120px]" />
      <div className="absolute -bottom-48 -right-32 h-[32rem] w-[32rem] rounded-full bg-sky-500/20 blur-[130px]" />
      <div className="absolute left-[42%] top-[25%] h-64 w-64 rounded-full bg-indigo-500/10 blur-[100px]" />

      <section className="relative z-10 grid h-full lg:grid-cols-[1.05fr_0.95fr]">
        {/* LEFT SECTION */}
        <div className="hidden h-full overflow-hidden p-8 lg:flex lg:flex-col lg:justify-between xl:p-10">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-xl shadow-violet-900/40">
              <Activity size={22} />
            </div>

            <div>
              <p className="text-base font-black tracking-tight text-white">
                KEYSTONE
              </p>
              <p className="text-xs text-slate-400">Field Service Platform</p>
            </div>
          </div>

          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/10 px-4 py-2 text-sm font-semibold text-violet-200">
              <ShieldCheck size={16} />
              Secure enterprise operations
            </div>

            <h1 className="mt-5 text-4xl font-black leading-[1.03] tracking-tight text-white xl:text-6xl">
              Every service job,
              <span className="block bg-gradient-to-r from-violet-400 via-fuchsia-300 to-sky-300 bg-clip-text text-transparent">
                beautifully controlled.
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-7 text-slate-400">
              Coordinate customers, sites, technicians, inventory, work orders,
              SLA performance and reporting from one secure workspace.
            </p>

            <div className="mt-6 grid gap-3">
              {roleBenefits.map(({ icon: Icon, title, description }) => (
                <article
                  key={title}
                  className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3.5 backdrop-blur-xl"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300">
                    <Icon size={19} />
                  </div>

                  <div>
                    <h2 className="text-sm font-bold text-white">{title}</h2>
                    <p className="mt-1 text-sm leading-5 text-slate-400">
                      {description}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-5 text-xs text-slate-500">
            <span className="flex items-center gap-2">
              <CheckCircle2 size={15} className="text-emerald-400" />
              JWT secured
            </span>

            <span className="flex items-center gap-2">
              <CheckCircle2 size={15} className="text-emerald-400" />
              Role protected
            </span>
          </div>
        </div>

        {/* RIGHT SECTION */}
        <div className="flex h-full items-center justify-center overflow-y-auto bg-white px-5 py-5 sm:px-8 lg:rounded-l-[3rem] lg:px-10">
          <div className="w-full max-w-md py-3">
            <div className="mb-6 flex items-center gap-3 lg:hidden">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 text-white">
                <Activity size={22} />
              </div>

              <div>
                <p className="font-black text-slate-950">KEYSTONE</p>
                <p className="text-xs text-slate-500">Field Service Platform</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">
                Welcome back
              </p>

              <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950 xl:text-4xl">
                Sign in to your workspace
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Enter your registered credentials to continue.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-sm font-bold text-slate-700"
                >
                  Email address
                </label>

                <div
                  className={`flex items-center rounded-2xl border bg-slate-50 px-4 transition focus-within:bg-white focus-within:ring-4 ${
                    fieldErrors.email
                      ? "border-red-300 focus-within:border-red-400 focus-within:ring-red-100"
                      : "border-slate-200 focus-within:border-violet-500 focus-within:ring-violet-100"
                  }`}
                >
                  <Mail size={18} className="shrink-0 text-slate-400" />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@company.com"
                    autoComplete="email"
                    className="w-full bg-transparent px-3 py-3.5 text-slate-900 outline-none placeholder:text-slate-400"
                  />
                </div>

                {fieldErrors.email && (
                  <p className="mt-1.5 text-sm font-medium text-red-500">
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-sm font-bold text-slate-700"
                  >
                    Password
                  </label>

                  <button
                    type="button"
                    className="text-sm font-semibold text-violet-600 transition hover:text-violet-800"
                  >
                    Forgot password?
                  </button>
                </div>

                <div
                  className={`flex items-center rounded-2xl border bg-slate-50 px-4 transition focus-within:bg-white focus-within:ring-4 ${
                    fieldErrors.password
                      ? "border-red-300 focus-within:border-red-400 focus-within:ring-red-100"
                      : "border-slate-200 focus-within:border-violet-500 focus-within:ring-violet-100"
                  }`}
                >
                  <LockKeyhole size={18} className="shrink-0 text-slate-400" />

                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="w-full bg-transparent px-3 py-3.5 text-slate-900 outline-none placeholder:text-slate-400"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((currentValue) => !currentValue)
                    }
                    className="text-slate-400 transition hover:text-violet-600"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {fieldErrors.password && (
                  <p className="mt-1.5 text-sm font-medium text-red-500">
                    {fieldErrors.password}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-700 px-6 py-3.5 font-bold text-white shadow-xl shadow-violet-200 transition hover:-translate-y-0.5 hover:shadow-2xl disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
              >
                {isSubmitting ? (
                  <>
                    <LoaderCircle size={18} className="animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in securely
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
              <div className="flex items-start gap-3">
                <ShieldCheck
                  size={19}
                  className="mt-0.5 shrink-0 text-emerald-600"
                />

                <div>
                  <p className="text-sm font-bold text-slate-800">
                    Secure authentication
                  </p>
                  <p className="mt-1 text-sm leading-5 text-slate-500">
                    Your session is protected using signed JWT authentication
                    and server-side role authorization.
                  </p>
                </div>
              </div>
            </div>

            <p className="mt-4 text-center text-xs leading-5 text-slate-400">
              Meridian Facilities Management · Authorized users only
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default LoginPage;
