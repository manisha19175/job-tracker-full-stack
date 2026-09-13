import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:8000";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");

  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [jobs, setJobs] = useState([]);

  const [formData, setFormData] = useState({
    company: "",
    job_title: "",
    location: "",
    job_url: "",
    status: "Applied",
    applied_date: "",
  });

  const [editingJobId, setEditingJobId] = useState(null);

  const [statusFilter, setStatusFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const [error, setError] = useState("");

  // External jobs
  const [externalJobs, setExternalJobs] = useState([]);
  const [externalSearch, setExternalSearch] = useState("python");
  const [externalLoading, setExternalLoading] = useState(false);
  const [externalError, setExternalError] = useState("");

  // Login
  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");

    try {
      const response = await fetch(`${API_URL}/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          username: loginUsername,
          password: loginPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsLoggedIn(true);
        setUsername(data.username);
        setLoginUsername("");
        setLoginPassword("");

        fetchJobs();
      } else {
        setError(data.message || "Invalid username or password");
      }
    } catch (error) {
      console.error(error);
      setError("Could not connect to Django server");
    }
  };

  // Get saved jobs
  const fetchJobs = async () => {
    try {
      const response = await fetch(`${API_URL}/jobs/`, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setJobs(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Get external jobs from Adzuna through Django
  const fetchExternalJobs = async () => {
    if (!externalSearch.trim()) {
      return;
    }

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

      const data = await response.json();

      if (response.ok) {
        setExternalJobs(data.results || []);
      } else {
        setExternalError(
          data.message || "Unable to fetch external jobs"
        );
        setExternalJobs([]);
      }
    } catch (error) {
      console.error(error);
      setExternalError("Could not connect to Django server");
      setExternalJobs([]);
    } finally {
      setExternalLoading(false);
    }
  };

  // Save an external job to My Jobs
  const handleSaveExternalJob = async (job) => {
    const today = new Date().toISOString().split("T")[0];

    const savedJob = {
      company: job.company?.display_name || "Unknown Company",
      job_title: job.title || "Unknown Job",
      location: job.location?.display_name || "Unknown Location",
      job_url: job.redirect_url || "",
      status: "Applied",
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

      const data = await response.json();

      if (response.ok) {
        alert("Job saved successfully!");
        fetchJobs();
      } else {
        console.error(data);
        alert("Could not save the job.");
      }
    } catch (error) {
      console.error(error);
      alert("Could not connect to Django server.");
    }
  };

  // Load saved jobs after login
  useEffect(() => {
    if (isLoggedIn) {
      fetchJobs();
    }
  }, [isLoggedIn]);

  // Form input change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Add or update saved job
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let response;

      if (editingJobId) {
        response = await fetch(
          `${API_URL}/jobs/${editingJobId}/`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(formData),
          }
        );
      } else {
        response = await fetch(`${API_URL}/jobs/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(formData),
        });
      }

      const data = await response.json();

      if (response.ok) {
        setFormData({
          company: "",
          job_title: "",
          location: "",
          job_url: "",
          status: "Applied",
          applied_date: "",
        });

        setEditingJobId(null);

        fetchJobs();
      } else {
        console.error(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Edit saved job
  const handleEdit = (job) => {
    setEditingJobId(job.id);

    setFormData({
      company: job.company,
      job_title: job.job_title,
      location: job.location,
      job_url: job.job_url,
      status: job.status,
      applied_date: job.applied_date,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditingJobId(null);

    setFormData({
      company: "",
      job_title: "",
      location: "",
      job_url: "",
      status: "Applied",
      applied_date: "",
    });
  };

  // Delete saved job
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this job?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/jobs/${id}/`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (response.ok || response.status === 204) {
        fetchJobs();
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Logout
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername("");
    setJobs([]);
    setExternalJobs([]);
  };

  // Status counts
  const statusCounts = {
    Applied: jobs.filter((job) => job.status === "Applied").length,
    Interview: jobs.filter((job) => job.status === "Interview").length,
    Selected: jobs.filter((job) => job.status === "Selected").length,
    Rejected: jobs.filter((job) => job.status === "Rejected").length,
    Offer: jobs.filter((job) => job.status === "Offer").length,
  };

  // Search + status filter for saved jobs
  const filteredJobs = jobs.filter((job) => {
    const matchesStatus =
      statusFilter === "All" ||
      job.status === statusFilter;

    const matchesSearch =
      job.company
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      job.job_title
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      job.location
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  // Login page
  if (!isLoggedIn) {
    return (
      <div className="app">
        <div className="login-container">
          <div className="login-card">
            <h1>Job Tracker</h1>

            <p className="subtitle">
              Track your job applications
            </p>

            <h2>Login</h2>

            <form onSubmit={handleLogin}>
              <label>Username</label>

              <input
                type="text"
                value={loginUsername}
                onChange={(e) =>
                  setLoginUsername(e.target.value)
                }
                placeholder="Enter username"
                required
              />

              <label>Password</label>

              <input
                type="password"
                value={loginPassword}
                onChange={(e) =>
                  setLoginPassword(e.target.value)
                }
                placeholder="Enter password"
                required
              />

              <button
                type="submit"
                className="primary-button"
              >
                Login
              </button>
            </form>

            {error && (
              <p style={{ color: "red", marginTop: "15px" }}>
                {error}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Dashboard
  return (
    <div className="app">
      <div className="dashboard">

        {/* Header */}
        <header className="header">
          <div>
            <h1>Job Tracker</h1>

            <p>
              Welcome, <strong>{username}</strong>
            </p>
          </div>

          <button
            className="secondary-button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </header>

        <main className="content">

          {/* External Job Search */}
          <div className="external-jobs-section">
            <h2>Search External Jobs</h2>

            <p>
              Search real job listings from Adzuna.
            </p>

            <div className="external-search-box">
              <input
                type="text"
                value={externalSearch}
                onChange={(e) =>
                  setExternalSearch(e.target.value)
                }
                placeholder="Search jobs e.g. Python Developer"
              />

              <button
                className="primary-button"
                onClick={fetchExternalJobs}
              >
                Search Jobs
              </button>
            </div>

            {externalLoading && (
              <p className="loading-message">
                Searching for jobs...
              </p>
            )}

            {externalError && (
              <p className="external-error">
                {externalError}
              </p>
            )}

            {!externalLoading &&
              !externalError &&
              externalJobs.length > 0 && (
                <div className="external-jobs-grid">
                  {externalJobs.map((job) => (
                    <div
                      className="external-job-card"
                      key={job.id}
                    >
                      <h3>{job.title}</h3>

                      <p className="company">
                        {job.company?.display_name ||
                          "Company not available"}
                      </p>

                      <p>
                        <strong>Location:</strong>{" "}
                        {job.location?.display_name ||
                          "Location not available"}
                      </p>

                      {job.category?.label && (
                        <p>
                          <strong>Category:</strong>{" "}
                          {job.category.label}
                        </p>
                      )}

                      <p className="external-description">
                        {job.description
                          ? job.description.substring(0, 180) + "..."
                          : "No description available."}
                      </p>

                      <div className="external-card-buttons">
                        <a
                          href={job.redirect_url}
                          target="_blank"
                          rel="noreferrer"
                          className="job-link"
                        >
                          View Job
                        </a>

                        <button
                          className="primary-button"
                          onClick={() =>
                            handleSaveExternalJob(job)
                          }
                        >
                          Save Job
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            {!externalLoading &&
              !externalError &&
              externalJobs.length === 0 && (
                <p className="external-empty">
                  Search for a job to see external listings.
                </p>
              )}

            <p className="adzuna-note">
              Job listings provided by Adzuna.
            </p>
          </div>

          {/* Add / Edit Job */}
          <div className="job-form-card">
            <h2>
              {editingJobId
                ? "Edit Job"
                : "Add New Job"}
            </h2>

            <form onSubmit={handleSubmit}>

              <label>Company</label>

              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="Company name"
                required
              />

              <label>Job Title</label>

              <input
                type="text"
                name="job_title"
                value={formData.job_title}
                onChange={handleChange}
                placeholder="Job title"
                required
              />

              <label>Location</label>

              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Hyderabad"
                required
              />

              <label>Job URL</label>

              <input
                type="url"
                name="job_url"
                value={formData.job_url}
                onChange={handleChange}
                placeholder="https://example.com/job"
                required
              />

              <label>Status</label>

              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="Applied">Applied</option>
                <option value="Interview">Interview</option>
                <option value="Selected">Selected</option>
                <option value="Rejected">Rejected</option>
                <option value="Offer">Offer</option>
              </select>

              <label>Applied Date</label>

              <input
                type="date"
                name="applied_date"
                value={formData.applied_date}
                onChange={handleChange}
                required
              />

              <div className="form-buttons">
                <button
                  type="submit"
                  className="primary-button"
                >
                  {editingJobId
                    ? "Update Job"
                    : "Add Job"}
                </button>

                {editingJobId && (
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </button>
                )}
              </div>

            </form>
          </div>

          {/* Status Summary */}
          <div className="status-summary">

            <div className="status-box">
              <h3>{statusCounts.Applied}</h3>
              <p>Applied</p>
            </div>

            <div className="status-box">
              <h3>{statusCounts.Interview}</h3>
              <p>Interview</p>
            </div>

            <div className="status-box">
              <h3>{statusCounts.Selected}</h3>
              <p>Selected</p>
            </div>

            <div className="status-box">
              <h3>{statusCounts.Rejected}</h3>
              <p>Rejected</p>
            </div>

            <div className="status-box">
              <h3>{statusCounts.Offer}</h3>
              <p>Offer</p>
            </div>

          </div>

          {/* My Saved Jobs */}
          <div className="jobs-header">
            <div>
              <h2>My Jobs</h2>

              <p>
                Track and manage your saved job applications
              </p>
            </div>
          </div>

          {/* Search Saved Jobs */}
          <div className="search-section">
            <label>Search My Jobs</label>

            <input
              type="text"
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
              placeholder="Search by company, job title or location"
            />
          </div>

          {/* Status Filter */}
          <div className="filter-section">
            <label>Filter by Status</label>

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
            >
              <option value="All">All</option>
              <option value="Applied">Applied</option>
              <option value="Interview">Interview</option>
              <option value="Selected">Selected</option>
              <option value="Rejected">Rejected</option>
              <option value="Offer">Offer</option>
            </select>
          </div>

          {/* Saved Jobs */}
          {filteredJobs.length === 0 ? (
            <div className="empty-state">
              <h3>No jobs found</h3>

              <p>
                Try changing your search or filter.
              </p>
            </div>
          ) : (
            <div className="jobs-grid">

              {filteredJobs.map((job) => (
                <div
                  className="job-card"
                  key={job.id}
                >

                  <div className="job-card-header">

                    <div>
                      <h3>{job.job_title}</h3>

                      <p className="company">
                        {job.company}
                      </p>
                    </div>

                    <span
                      className={`status status-${job.status
                        .toLowerCase()
                        .replace(" ", "-")}`}
                    >
                      {job.status}
                    </span>

                  </div>

                  <p>
                    <strong>Location:</strong>{" "}
                    {job.location}
                  </p>

                  <p>
                    <strong>Applied:</strong>{" "}
                    {job.applied_date}
                  </p>

                  <a
                    href={job.job_url}
                    target="_blank"
                    rel="noreferrer"
                    className="job-link"
                  >
                    View Job
                  </a>

                  <div className="card-buttons">

                    <button
                      className="edit-button"
                      onClick={() =>
                        handleEdit(job)
                      }
                    >
                      Edit
                    </button>

                    <button
                      className="delete-button"
                      onClick={() =>
                        handleDelete(job.id)
                      }
                    >
                      Delete
                    </button>

                  </div>

                </div>
              ))}

            </div>
          )}

        </main>
      </div>
    </div>
  );
}

export default App;