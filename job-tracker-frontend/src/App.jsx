
import { useState } from "react";
import { Eye, EyeOff, BriefcaseBusiness, CheckCircle2 } from "lucide-react";
import "./App.css";

const API_URL = "https://job-tracker-full-stack.onrender.com";

async function readApiResponse(response) {
  const responseText = await response.text();

  let data;

  try {
    data = responseText ? JSON.parse(responseText) : {};
  } catch {
    console.error(
      "API returned a non-JSON response:",
      response.status,
      responseText.slice(0, 500)
    );

    throw new Error(
      `Server returned HTML or invalid JSON (HTTP ${response.status}). Check the API URL and Render logs.`
    );
  }

  if (!response.ok) {
    const errorMessage =
      data.message ||
      data.detail ||
      data.error ||
      (typeof data === "object"
        ? Object.values(data).flat().join(" ")
        : "");

    throw new Error(
      errorMessage || `Request failed (HTTP ${response.status})`
    );
  }

  return data;
}

function PasswordField({
  label,
  value,
  onChange,
  visible,
  onToggle,
  placeholder,
  autoComplete,
}) {
  return (
    <div className="auth-field">
      <label>{label}</label>

      <div className="auth-input-wrapper">
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required
        />

        <button
          type="button"
          className="password-toggle-button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={onToggle}
          aria-label={visible ? "Hide password" : "Show password"}
          title={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff size={19} /> : <Eye size={19} />}
        </button>
      </div>
    </div>
  );
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Authentication form state
  const [authMode, setAuthMode] = useState("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  // Dashboard form state
  const [company, setCompany] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [location, setLocation] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [status, setStatus] = useState("Applied");
  const [appliedDate, setAppliedDate] = useState("");

  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [externalJobs, setExternalJobs] = useState([]);
  const [externalSearch, setExternalSearch] = useState("python");
  const [externalLoading, setExternalLoading] = useState(false);
  const [externalError, setExternalError] = useState("");

  // Fetch jobs belonging to the authenticated user.
  const fetchJobs = async () => {
    try {
      const response = await fetch(`${API_URL}/jobs/`, {
        credentials: "include",
      });

      const data = await readApiResponse(response);

      setJobs(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error("Fetch jobs error:", err);
      setError(err.message || "Unable to fetch jobs");
    }
  };

  // Switch between login and registration.
  const switchAuthMode = (mode) => {
    setAuthMode(mode);
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirmPassword(false);
    setMessage("");
    setError("");
  };

  // Register a new account.
  const handleRegister = async (event) => {
    event.preventDefault();

    if (authLoading) return;

    setMessage("");
    setError("");

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setAuthLoading(true);

    try {
      const response = await fetch(`${API_URL}/register/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim(),
          password,
        }),
      });

      await readApiResponse(response);

      setMessage("Account created successfully! Please log in.");
      setPassword("");
      setConfirmPassword("");
      setAuthMode("login");
      setShowPassword(false);
      setShowConfirmPassword(false);
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.message || "Unable to create your account");
    } finally {
      setAuthLoading(false);
    }
  };

  // Login.
  const handleLogin = async (event) => {
    event.preventDefault();

    if (authLoading) return;

    setAuthLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      const data = await readApiResponse(response);

      console.log("Login response:", data);

      setUsername(data.username || username.trim());
      setIsLoggedIn(true);
      setPassword("");
      setMessage("");
      setError("");

      await fetchJobs();
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Unable to log in");
    } finally {
      setAuthLoading(false);
    }
  };

  // Add a job manually.
  const handleAddJob = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/jobs/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          company,
          job_title: jobTitle,
          location,
          job_url: jobUrl,
          status,
          applied_date: appliedDate,
        }),
      });

      await readApiResponse(response);

      setMessage("Job added successfully");

      setCompany("");
      setJobTitle("");
      setLocation("");
      setJobUrl("");
      setStatus("Applied");
      setAppliedDate("");

      await fetchJobs();
    } catch (err) {
      console.error("Add job error:", err);
      setError(err.message || "Unable to add job");
    }
  };

  // Update job status.
  const handleUpdateStatus = async (id, newStatus) => {
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/jobs/${id}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      await readApiResponse(response);

      setMessage("Job status updated successfully");
      await fetchJobs();
    } catch (err) {
      console.error("Update status error:", err);
      setError(err.message || "Unable to update job status");
    }
  };

  // Delete a tracked job.
  const handleDeleteJob = async (id) => {
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/jobs/${id}/`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        await readApiResponse(response);
      }

      setMessage("Job deleted successfully");
      await fetchJobs();
    } catch (err) {
      console.error("Delete job error:", err);
      setError(err.message || "Unable to delete job");
    }
  };

  // Search external jobs through the Django backend.
  const fetchExternalJobs = async () => {
    setExternalLoading(true);
    setExternalError("");

    try {
      const response = await fetch(
        `${API_URL}/jobs/external/?search=${encodeURIComponent(
          externalSearch
        )}`,
        {
          credentials: "include",
        }
      );

      const data = await readApiResponse(response);

      const results = Array.isArray(data)
        ? data
        : data.results || [];

      setExternalJobs(results);

      if (results.length === 0) {
        setExternalError("No external jobs found for this search.");
      }
    } catch (err) {
      console.error("External jobs error:", err);
      setExternalError(
        err.message || "Unable to fetch external jobs"
      );
      setExternalJobs([]);
    } finally {
      setExternalLoading(false);
    }
  };

  // Save an external job to My Jobs.
  const handleSaveExternalJob = async (job) => {
    setError("");
    setMessage("");

    const today = new Date().toISOString().split("T")[0];

    const savedJob = {
      company: job.company?.display_name || "Unknown Company",
      job_title: job.title || "Unknown Job",
      location: job.location?.display_name || "Unknown Location",
      job_url: job.redirect_url || "",
      status: "Saved",
      applied_date: today,
    };

    try {
      const response = await fetch(`${API_URL}/jobs/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(savedJob),
      });

      await readApiResponse(response);

      setMessage("External job saved successfully");
      await fetchJobs();
    } catch (err) {
      console.error("Save external job error:", err);
      setError(err.message || "Unable to save external job");
    }
  };

  // Filter tracked jobs.
  const filteredJobs = jobs.filter((job) => {
    const companyName = (job.company || "").toLowerCase();
    const title = (job.job_title || "").toLowerCase();
    const jobLocation = (job.location || "").toLowerCase();
    const query = search.toLowerCase();

    const matchesSearch =
      companyName.includes(query) ||
      title.includes(query) ||
      jobLocation.includes(query);

    const matchesStatus =
      statusFilter === "All" || job.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const savedCount = jobs.filter(
    (job) => job.status === "Saved"
  ).length;

  const appliedCount = jobs.filter(
    (job) => job.status === "Applied"
  ).length;

  const interviewCount = jobs.filter(
    (job) => job.status === "Interview"
  ).length;

  const selectedCount = jobs.filter(
    (job) => job.status === "Selected"
  ).length;

  const rejectedCount = jobs.filter(
    (job) => job.status === "Rejected"
  ).length;

  // Login and registration screens.
  if (!isLoggedIn) {
    const isRegister = authMode === "register";

    return (
      <div className="login-page">
        <section className="auth-layout">
          <div className="auth-brand-panel">
            <div className="brand-logo">
              <span className="brand-icon">
                <BriefcaseBusiness size={25} />
              </span>
              <span>JobTracker</span>
            </div>

            <div className="brand-content">
              <span className="brand-eyebrow">
                YOUR CAREER, ORGANIZED
              </span>

              <h1>
                Make your next
                <br />
                career move
                <br />
                <span>with confidence.</span>
              </h1>

              <p>
                Keep every application organized, follow your progress,
                and stay focused on the opportunities that matter.
              </p>

              <div className="brand-features">
                <div>
                  <CheckCircle2 size={19} />
                  <span>Track all your applications in one place</span>
                </div>

                <div>
                  <CheckCircle2 size={19} />
                  <span>Monitor interviews and application progress</span>
                </div>

                <div>
                  <CheckCircle2 size={19} />
                  <span>Discover and save external job opportunities</span>
                </div>
              </div>
            </div>

            <div className="brand-footer">
              Organize your search. Move your career forward.
            </div>
          </div>

          <div className="auth-form-panel">
            <div className="auth-card">
              <div className="auth-mobile-logo">
                <span className="brand-icon">
                  <BriefcaseBusiness size={22} />
                </span>
                <span>JobTracker</span>
              </div>

              <div className="auth-heading">
                <span className="auth-eyebrow">
                  {isRegister ? "GET STARTED" : "WELCOME BACK"}
                </span>

                <h2>
                  {isRegister
                    ? "Create your account"
                    : "Sign in to your account"}
                </h2>

                <p>
                  {isRegister
                    ? "Create an account to start organizing your job search."
                    : "Enter your details to access your job dashboard."}
                </p>
              </div>

              <div className="auth-tabs">
                <button
                  type="button"
                  className={!isRegister ? "active" : ""}
                  onClick={() => switchAuthMode("login")}
                >
                  Login
                </button>

                <button
                  type="button"
                  className={isRegister ? "active" : ""}
                  onClick={() => switchAuthMode("register")}
                >
                  Create account
                </button>
              </div>

              <form
                className="auth-form"
                onSubmit={isRegister ? handleRegister : handleLogin}
              >
                <div className="auth-field">
                  <label htmlFor="auth-username">Username</label>
                  <input
                    id="auth-username"
                    type="text"
                    value={username}
                    onChange={(event) =>
                      setUsername(event.target.value)
                    }
                    placeholder="Enter your username"
                    autoComplete="username"
                    required
                  />
                </div>

                {isRegister && (
                  <div className="auth-field">
                    <label htmlFor="auth-email">
                      Email address <span>(optional)</span>
                    </label>
                    <input
                      id="auth-email"
                      type="email"
                      value={email}
                      onChange={(event) =>
                        setEmail(event.target.value)
                      }
                      placeholder="Enter your email address"
                      autoComplete="email"
                    />
                  </div>
                )}

                <PasswordField
                  label="Password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  visible={showPassword}
                  onToggle={() =>
                    setShowPassword((current) => !current)
                  }
                  placeholder="Enter your password"
                  autoComplete={
                    isRegister ? "new-password" : "current-password"
                  }
                />

                {isRegister && (
                  <PasswordField
                    label="Confirm password"
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(event.target.value)
                    }
                    visible={showConfirmPassword}
                    onToggle={() =>
                      setShowConfirmPassword((current) => !current)
                    }
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
                  />
                )}

                {isRegister && (
                  <p className="password-hint">
                    Use at least 8 characters for your password.
                  </p>
                )}

                <button
                  type="submit"
                  className="auth-submit-button"
                  disabled={authLoading}
                >
                  {authLoading
                    ? isRegister
                      ? "Creating account..."
                      : "Signing in..."
                    : isRegister
                      ? "Create account"
                      : "Sign in"}
                </button>
              </form>

              {message && (
                <p className="success-message">{message}</p>
              )}

              {error && (
                <p className="error-message">{error}</p>
              )}

              <p className="auth-switch-text">
                {isRegister
                  ? "Already have an account?"
                  : "Don't have an account?"}{" "}
                <button
                  type="button"
                  onClick={() =>
                    switchAuthMode(isRegister ? "login" : "register")
                  }
                >
                  {isRegister ? "Login" : "Create account"}
                </button>
              </p>

              <p className="auth-security-note">
                Your job applications are stored in your account.
              </p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // Dashboard.
  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Job Tracker</h1>
          <p>Welcome, {username || "User"}</p>
        </div>
      </header>

      <main className="dashboard-content">
        {message && (
          <p className="success-message">{message}</p>
        )}

        {error && (
          <p className="error-message">{error}</p>
        )}

        {/* Add Job */}
        <section className="card">
          <h2>Add Job</h2>

          <form className="job-form" onSubmit={handleAddJob}>
            <input
              type="text"
              value={company}
              onChange={(event) => setCompany(event.target.value)}
              placeholder="Company"
              required
            />

            <input
              type="text"
              value={jobTitle}
              onChange={(event) => setJobTitle(event.target.value)}
              placeholder="Job Title"
              required
            />

            <input
              type="text"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="Location"
              required
            />

            <input
              type="url"
              value={jobUrl}
              onChange={(event) => setJobUrl(event.target.value)}
              placeholder="Job URL"
              required
            />

            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="Saved">Saved</option>
              <option value="Applied">Applied</option>
              <option value="Interview">Interview</option>
              <option value="Selected">Selected</option>
              <option value="Rejected">Rejected</option>
            </select>

            <input
              type="date"
              value={appliedDate}
              onChange={(event) => setAppliedDate(event.target.value)}
              required
            />

            <button type="submit">Add Job</button>
          </form>
        </section>

        {/* Application status summary */}
        <section className="status-summary">
          <div className="status-card">
            <span>Saved</span>
            <strong>{savedCount}</strong>
          </div>

          <div className="status-card">
            <span>Applied</span>
            <strong>{appliedCount}</strong>
          </div>

          <div className="status-card">
            <span>Interview</span>
            <strong>{interviewCount}</strong>
          </div>

          <div className="status-card">
            <span>Selected</span>
            <strong>{selectedCount}</strong>
          </div>

          <div className="status-card">
            <span>Rejected</span>
            <strong>{rejectedCount}</strong>
          </div>
        </section>

        {/* My Jobs */}
        <section className="card">
          <div className="section-header">
            <h2>My Jobs</h2>

            <div className="filters">
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search jobs..."
              />

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
              >
                <option value="All">All</option>
                <option value="Saved">Saved</option>
                <option value="Applied">Applied</option>
                <option value="Interview">Interview</option>
                <option value="Selected">Selected</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div className="jobs-grid">
            {filteredJobs.length === 0 ? (
              <p>No jobs found.</p>
            ) : (
              filteredJobs.map((job) => (
                <div className="job-card" key={job.id}>
                  <h3>{job.job_title}</h3>

                  <p>
                    <strong>Company:</strong> {job.company}
                  </p>

                  <p>
                    <strong>Location:</strong> {job.location}
                  </p>

                  <p>
                    <strong>Status:</strong>{" "}
                    <select
                      value={job.status}
                      onChange={(event) =>
                        handleUpdateStatus(job.id, event.target.value)
                      }
                    >
                      <option value="Saved">Saved</option>
                      <option value="Applied">Applied</option>
                      <option value="Interview">Interview</option>
                      <option value="Selected">Selected</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </p>

                  <p>
                    <strong>Applied Date:</strong>{" "}
                    {job.applied_date}
                  </p>

                  <div className="job-actions">
                    <a
                      href={job.job_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View Job
                    </a>

                    <button
                      type="button"
                      onClick={() => handleDeleteJob(job.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* External Job Search */}
        <section className="card external-section">
          <div className="section-header">
            <div>
              <h2>External Job Search</h2>
              <p>Search current job listings from Adzuna.</p>
            </div>
          </div>

          <form
            className="external-search"
            onSubmit={(event) => {
              event.preventDefault();
              fetchExternalJobs();
            }}
          >
            <input
              type="text"
              value={externalSearch}
              onChange={(event) =>
                setExternalSearch(event.target.value)
              }
              placeholder="Search jobs..."
              required
            />

            <button type="submit" disabled={externalLoading}>
              {externalLoading ? "Searching..." : "Search Jobs"}
            </button>
          </form>

          {externalError && (
            <p className="error-message">{externalError}</p>
          )}

          <div className="external-jobs-grid">
            {externalJobs.map((job, index) => (
              <div
                className="external-job-card"
                key={job.id || index}
              >
                <h3>{job.title}</h3>

                <p>
                  <strong>Company:</strong>{" "}
                  {job.company?.display_name || "Unknown Company"}
                </p>

                <p>
                  <strong>Location:</strong>{" "}
                  {job.location?.display_name || "Unknown Location"}
                </p>

                <p>
                  <strong>Category:</strong>{" "}
                  {job.category?.label || "Not specified"}
                </p>

                <p>
                  {job.description
                    ? job.description.substring(0, 180) + "..."
                    : "No description available."}
                </p>

                <div className="job-actions">
                  <a
                    href={job.redirect_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View Job
                  </a>

                  <button
                    type="button"
                    className="saved-job-button"
                    onClick={() => handleSaveExternalJob(job)}
                  >
                    Save Job
                  </button>
                </div>
              </div>
            ))}
          </div>

          <p className="adzuna-note">
            Job listings provided by Adzuna.
          </p>
        </section>
      </main>
    </div>
  );
}

export default App;
