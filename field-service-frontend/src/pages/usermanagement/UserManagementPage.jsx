import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Edit3,
  KeyRound,
  Loader2,
  Plus,
  Search,
  ShieldCheck,
  UserCheck,
  UserRound,
  Users,
  UserX,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

import {
  activateManagedUser,
  createManagedUser,
  deactivateManagedUser,
  getManagedUsers,
  resetManagedUserPassword,
  updateManagedUser,
} from "../../services/userManagementService";

const EMPTY_CREATE_FORM = {
  name: "",
  email: "",
  phoneNumber: "",
  department: "",
  role: "TECHNICIAN",
  temporaryPassword: "",
};

const EMPTY_EDIT_FORM = {
  name: "",
  email: "",
  phoneNumber: "",
  department: "",
  role: "TECHNICIAN",
};

function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState(EMPTY_CREATE_FORM);
  const [creating, setCreating] = useState(false);

  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY_EDIT_FORM);
  const [updating, setUpdating] = useState(false);

  const [resetUser, setResetUser] = useState(null);
  const [temporaryPassword, setTemporaryPassword] = useState("");
  const [resettingPassword, setResettingPassword] = useState(false);

  const [statusChangingId, setStatusChangingId] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchUsers = async () => {
      try {
        const data = await getManagedUsers();

        if (isMounted) {
          setUsers(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        if (isMounted) {
          toast.error(error.response?.data?.message || "Unable to load users.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void fetchUsers();

    return () => {
      isMounted = false;
    };
  }, []);
  const statistics = useMemo(() => {
    return {
      total: users.length,

      technicians: users.filter((user) => user.role === "TECHNICIAN").length,

      dispatchers: users.filter((user) => user.role === "DISPATCHER").length,

      customers: users.filter((user) => user.role === "CUSTOMER").length,
    };
  }, [users]);

  const filteredUsers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !query ||
        user.name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.department?.toLowerCase().includes(query) ||
        user.role?.toLowerCase().includes(query);

      const matchesRole = roleFilter === "ALL" || user.role === roleFilter;

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && user.active) ||
        (statusFilter === "INACTIVE" && !user.active);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  const handleCreateChange = (event) => {
    const { name, value } = event.target;

    setCreateForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;

    setEditForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleCreateUser = async (event) => {
    event.preventDefault();

    if (
      !createForm.name.trim() ||
      !createForm.email.trim() ||
      !createForm.temporaryPassword
    ) {
      toast.error("Name, email and temporary password are required.");
      return;
    }

    if (createForm.temporaryPassword.length < 8) {
      toast.error("Temporary password must contain at least 8 characters.");
      return;
    }

    try {
      setCreating(true);

      const createdUser = await createManagedUser({
        name: createForm.name.trim(),
        email: createForm.email.trim(),
        phoneNumber: createForm.phoneNumber.trim(),
        department: createForm.department.trim(),
        role: createForm.role,
        temporaryPassword: createForm.temporaryPassword,
      });

      setUsers((current) => [createdUser, ...current]);

      setCreateForm(EMPTY_CREATE_FORM);
      setShowCreateModal(false);

      toast.success("User account created successfully.");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Unable to create user.",
      );
    } finally {
      setCreating(false);
    }
  };

  const openEditModal = (user) => {
    setEditingUser(user);

    setEditForm({
      name: user.name || "",
      email: user.email || "",
      phoneNumber: user.phoneNumber || "",
      department: user.department || "",
      role: user.role || "TECHNICIAN",
    });
  };

  const handleUpdateUser = async (event) => {
    event.preventDefault();

    if (!editingUser) {
      return;
    }

    if (!editForm.name.trim() || !editForm.email.trim()) {
      toast.error("Name and email are required.");
      return;
    }

    try {
      setUpdating(true);

      const updatedUser = await updateManagedUser(editingUser.id, {
        name: editForm.name.trim(),
        email: editForm.email.trim(),
        phoneNumber: editForm.phoneNumber.trim(),
        department: editForm.department.trim(),
        role: editForm.role,
      });

      setUsers((current) =>
        current.map((user) =>
          user.id === updatedUser.id ? updatedUser : user,
        ),
      );

      setEditingUser(null);

      toast.success("User updated successfully.");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Unable to update user.",
      );
    } finally {
      setUpdating(false);
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      setStatusChangingId(user.id);

      const updatedUser = user.active
        ? await deactivateManagedUser(user.id)
        : await activateManagedUser(user.id);

      setUsers((current) =>
        current.map((item) =>
          item.id === updatedUser.id ? updatedUser : item,
        ),
      );

      toast.success(
        updatedUser.active
          ? "User account activated."
          : "User account deactivated.",
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to change account status.",
      );
    } finally {
      setStatusChangingId(null);
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();

    if (!resetUser) {
      return;
    }

    if (temporaryPassword.length < 8) {
      toast.error("Temporary password must contain at least 8 characters.");
      return;
    }

    try {
      setResettingPassword(true);

      await resetManagedUserPassword(resetUser.id, temporaryPassword);

      setResetUser(null);
      setTemporaryPassword("");

      toast.success("Password reset successfully.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to reset password.");
    } finally {
      setResettingPassword(false);
    }
  };

  const formatRole = (role) => {
    if (!role) {
      return "Unknown";
    }

    return role
      .toLowerCase()
      .replace("_", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-bold text-violet-600">
            <ShieldCheck size={18} />
            Manager Administration
          </div>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
            User Management
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Create and manage Technician, Dispatcher and Customer login
            accounts.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:shadow-xl"
        >
          <Plus size={18} />
          Create User
        </button>
      </section>

      {/* STATISTICS */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Users" value={statistics.total} icon={Users} />

        <StatCard
          title="Technicians"
          value={statistics.technicians}
          icon={UserCheck}
        />

        <StatCard
          title="Dispatchers"
          value={statistics.dispatchers}
          icon={ShieldCheck}
        />

        <StatCard
          title="Customers"
          value={statistics.customers}
          icon={UserRound}
        />
      </section>

      {/* TABLE CARD */}
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        {/* FILTERS */}
        <div className="border-b border-slate-200 p-5">
          <div className="flex flex-col gap-3 xl:flex-row">
            <div className="flex flex-1 items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 focus-within:border-violet-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-violet-100">
              <Search size={18} className="shrink-0 text-slate-400" />

              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by name, email, department or role..."
                className="w-full bg-transparent px-3 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
            >
              <option value="ALL">All Roles</option>
              <option value="TECHNICIAN">Technicians</option>
              <option value="DISPATCHER">Dispatchers</option>
              <option value="CUSTOMER">Customers</option>
            </select>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-80 items-center justify-center">
            <div className="text-center">
              <Loader2
                size={34}
                className="mx-auto animate-spin text-violet-600"
              />

              <p className="mt-3 text-sm font-semibold text-slate-500">
                Loading users...
              </p>
            </div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex min-h-80 items-center justify-center p-8">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                <Users size={28} />
              </div>

              <h3 className="mt-4 text-lg font-black text-slate-900">
                No users found
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Create a new account or change your search filters.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px]">
              <thead className="bg-slate-50">
                <tr className="text-left text-xs font-black uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Last Login</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="transition hover:bg-slate-50/70">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 font-black text-violet-700">
                          {user.name?.charAt(0)?.toUpperCase() || "U"}
                        </div>

                        <div className="min-w-0">
                          <p className="font-bold text-slate-900">
                            {user.name}
                          </p>

                          <p className="mt-0.5 text-sm text-slate-500">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      <span className="inline-flex rounded-xl bg-violet-50 px-3 py-1.5 text-xs font-black text-violet-700">
                        {formatRole(user.role)}
                      </span>
                    </td>

                    <td className="px-6 py-5 text-sm font-medium text-slate-600">
                      {user.department || "Not assigned"}
                    </td>

                    <td className="px-6 py-5">
                      {user.active ? (
                        <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-700">
                          <CheckCircle2 size={14} />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-xl bg-red-50 px-3 py-1.5 text-xs font-black text-red-700">
                          <UserX size={14} />
                          Inactive
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-5 text-sm text-slate-500">
                      {user.lastLogin
                        ? new Date(user.lastLogin).toLocaleString()
                        : "Never"}
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          title="Edit user"
                          onClick={() => openEditModal(user)}
                          className="rounded-xl border border-slate-200 p-2.5 text-slate-600 transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700"
                        >
                          <Edit3 size={17} />
                        </button>

                        <button
                          type="button"
                          title="Reset password"
                          onClick={() => {
                            setResetUser(user);
                            setTemporaryPassword("");
                          }}
                          className="rounded-xl border border-slate-200 p-2.5 text-slate-600 transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700"
                        >
                          <KeyRound size={17} />
                        </button>

                        <button
                          type="button"
                          disabled={statusChangingId === user.id}
                          onClick={() => handleToggleStatus(user)}
                          className={`rounded-xl px-3 py-2 text-xs font-black transition disabled:cursor-not-allowed disabled:opacity-60 ${
                            user.active
                              ? "bg-red-50 text-red-700 hover:bg-red-100"
                              : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          }`}
                        >
                          {statusChangingId === user.id ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : user.active ? (
                            "Deactivate"
                          ) : (
                            "Activate"
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* CREATE USER MODAL */}
      {showCreateModal && (
        <Modal
          title="Create User Account"
          subtitle="Create a login account for a Technician, Dispatcher or Customer."
          onClose={() => {
            if (!creating) {
              setShowCreateModal(false);
              setCreateForm(EMPTY_CREATE_FORM);
            }
          }}
        >
          <form onSubmit={handleCreateUser} className="space-y-4">
            <FormInput
              label="Full Name"
              name="name"
              value={createForm.name}
              onChange={handleCreateChange}
              placeholder="Enter full name"
              required
            />

            <FormInput
              label="Email / Login Username"
              name="email"
              type="email"
              value={createForm.email}
              onChange={handleCreateChange}
              placeholder="user@example.com"
              required
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormInput
                label="Phone Number"
                name="phoneNumber"
                value={createForm.phoneNumber}
                onChange={handleCreateChange}
                placeholder="9876543210"
              />

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Role
                </label>

                <select
                  name="role"
                  value={createForm.role}
                  onChange={handleCreateChange}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                >
                  <option value="TECHNICIAN">Technician</option>
                  <option value="DISPATCHER">Dispatcher</option>
                  <option value="CUSTOMER">Customer</option>
                </select>
              </div>
            </div>

            <FormInput
              label="Department"
              name="department"
              value={createForm.department}
              onChange={handleCreateChange}
              placeholder="Example: Field Operations"
            />

            <FormInput
              label="Temporary Password"
              name="temporaryPassword"
              type="password"
              value={createForm.temporaryPassword}
              onChange={handleCreateChange}
              placeholder="Minimum 8 characters"
              required
            />

            <p className="rounded-2xl bg-amber-50 px-4 py-3 text-xs font-medium leading-5 text-amber-800">
              Share this temporary password securely with the user. Their actual
              stored password will be BCrypt encrypted and cannot be viewed
              later.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={creating}
                onClick={() => {
                  setShowCreateModal(false);
                  setCreateForm(EMPTY_CREATE_FORM);
                }}
                className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={creating}
                className="inline-flex items-center gap-2 rounded-2xl bg-violet-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {creating && <Loader2 size={17} className="animate-spin" />}
                Create Account
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* EDIT USER MODAL */}
      {editingUser && (
        <Modal
          title="Edit User"
          subtitle={`Update account information for ${editingUser.name}.`}
          onClose={() => {
            if (!updating) {
              setEditingUser(null);
            }
          }}
        >
          <form onSubmit={handleUpdateUser} className="space-y-4">
            <FormInput
              label="Full Name"
              name="name"
              value={editForm.name}
              onChange={handleEditChange}
              required
            />

            <FormInput
              label="Email"
              name="email"
              type="email"
              value={editForm.email}
              onChange={handleEditChange}
              required
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormInput
                label="Phone Number"
                name="phoneNumber"
                value={editForm.phoneNumber}
                onChange={handleEditChange}
              />

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Role
                </label>

                <select
                  name="role"
                  value={editForm.role}
                  onChange={handleEditChange}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                >
                  <option value="TECHNICIAN">Technician</option>
                  <option value="DISPATCHER">Dispatcher</option>
                  <option value="CUSTOMER">Customer</option>
                </select>
              </div>
            </div>

            <FormInput
              label="Department"
              name="department"
              value={editForm.department}
              onChange={handleEditChange}
            />

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={updating}
                onClick={() => setEditingUser(null)}
                className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={updating}
                className="inline-flex items-center gap-2 rounded-2xl bg-violet-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-violet-700 disabled:opacity-60"
              >
                {updating && <Loader2 size={17} className="animate-spin" />}
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* RESET PASSWORD MODAL */}
      {resetUser && (
        <Modal
          title="Reset Password"
          subtitle={`Set a new temporary password for ${resetUser.name}.`}
          onClose={() => {
            if (!resettingPassword) {
              setResetUser(null);
              setTemporaryPassword("");
            }
          }}
        >
          <form onSubmit={handleResetPassword} className="space-y-4">
            <FormInput
              label="New Temporary Password"
              type="password"
              value={temporaryPassword}
              onChange={(event) => setTemporaryPassword(event.target.value)}
              placeholder="Minimum 8 characters"
              required
            />

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex gap-3">
                <KeyRound
                  size={19}
                  className="mt-0.5 shrink-0 text-amber-700"
                />

                <p className="text-sm leading-6 text-amber-800">
                  The old password cannot be viewed. Resetting replaces it with
                  this new BCrypt-encrypted password.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={resettingPassword}
                onClick={() => {
                  setResetUser(null);
                  setTemporaryPassword("");
                }}
                className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={resettingPassword}
                className="inline-flex items-center gap-2 rounded-2xl bg-amber-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-amber-600 disabled:opacity-60"
              >
                {resettingPassword && (
                  <Loader2 size={17} className="animate-spin" />
                )}
                Reset Password
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

function StatCard({ title, value, icon: Icon }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-500">{title}</p>

          <p className="mt-2 text-3xl font-black text-slate-950">{value}</p>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-700">
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}

function FormInput({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder = "",
  required = false,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-slate-700">
        {label}
      </label>

      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
      />
    </div>
  );
}

function Modal({ title, subtitle, children, onClose }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-white/20 bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-200 bg-white px-6 py-5">
          <div>
            <h2 className="text-xl font-black text-slate-950">{title}</h2>

            <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export default UserManagementPage;
