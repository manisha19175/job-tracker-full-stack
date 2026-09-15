import { useEffect, useState } from "react";
import "./App.css";


const API_URL = "https://job-tracker-full-stack.onrender.com";


function App() {

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

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


  const fetchJobs = async () => {

    try {

      const response = await fetch(
        `${API_URL}/jobs/`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Unable to fetch jobs");
      }

      const data = await response.json();

      setJobs(data);

    } catch (error) {

      setError(error.message);

    }

  };


  const handleLogin = async (event) => {

    event.preventDefault();

    setError("");
    setMessage("");

    try {

      const response = await fetch(
        `${API_URL}/login/`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          credentials: "include",

          body: JSON.stringify({
            username: username,
            password: password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {

        throw new Error(
          data.message || "Invalid username or password"
        );

      }

      setIsLoggedIn(true);

      setMessage("Login successful");

      fetchJobs();

    } catch (error) {

      setError(error.message);

    }

  };


  const handleAddJob = async (event) => {

    event.preventDefault();

    setError("");
    setMessage("");

    try {

      const response = await fetch(
        `${API_URL}/jobs/`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          credentials: "include",

          body: JSON.stringify({
            company: company,
            job_title: jobTitle,
            location: location,
            job_url: jobUrl,
            status: status,
            applied_date: appliedDate,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {

        throw new Error(
          data.detail ||
          data.message ||
          "Unable to add job"
        );

      }

      setMessage("Job added successfully");

      setCompany("");
      setJobTitle("");
      setLocation("");
      setJobUrl("");
      setStatus("Applied");
      setAppliedDate("");

      fetchJobs();

    } catch (error) {

      setError(error.message);

    }

  };


  const handleDeleteJob = async (id) => {

    try {

      const response = await fetch(
        `${API_URL}/jobs/${id}/`,
        {
          method: "DELETE",

          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Unable to delete job");
      }

      setMessage("Job deleted successfully");

      fetchJobs();

    } catch (error) {

      setError(error.message);

    }

  };


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

      const data = await response.json();

      if (!response.ok) {

        throw new Error(
          data.message ||
          "Unable to fetch external jobs"
        );

      }

      setExternalJobs(data.results || []);

    } catch (error) {

      setExternalError(error.message);

    } finally {

      setExternalLoading(false);

    }

  };


  const handleSaveExternalJob = async (job) => {

    const today = new Date()
      .toISOString()
      .split("T")[0];

    const savedJob = {

      company:
        job.company?.display_name ||
        "Unknown Company",

      job_title:
        job.title ||
        "Unknown Job",

      location:
        job.location?.display_name ||
        "Unknown Location",

      job_url:
        job.redirect_url ||
        "",

      status:
        "Applied",

      applied_date:
        today,
    };


    try {

      const response = await fetch(
        `${API_URL}/jobs/`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          credentials: "include",

          body: JSON.stringify(savedJob),
        }
      );

      const data = await response.json();

      if (!response.ok) {

        throw new Error(
          data.detail ||
          data.message ||
          "Unable to save job"
        );

      }

      setMessage("Job saved successfully");

      fetchJobs();

    } catch (error) {

      setError(error.message);

    }

  };


  useEffect(() => {

    if (isLoggedIn) {
      fetchJobs();
    }

  }, [isLoggedIn]);


  const filteredJobs = jobs.filter((job) => {

    const matchesSearch =
      job.company
        .toLowerCase()
        .includes(search.toLowerCase()) ||

      job.job_title
        .toLowerCase()
        .includes(search.toLowerCase()) ||

      job.location
        .toLowerCase()
        .includes(search.toLowerCase());


    const matchesStatus =
      statusFilter === "All" ||
      job.status === statusFilter;


    return matchesSearch && matchesStatus;

  });


  const appliedCount =
    jobs.filter(
      (job) => job.status === "Applied"
    ).length;


  const interviewCount =
    jobs.filter(
      (job) => job.status === "Interview"
    ).length;


  const selectedCount =
    jobs.filter(
      (job) => job.status === "Selected"
    ).length;


  const rejectedCount =
    jobs.filter(
      (job) => job.status === "Rejected"
    ).length;


  if (!isLoggedIn) {

    return (

      <div className="login-page">

        <div className="login-card">

          <h1>Job Tracker</h1>

          <p>
            Track your job applications in one place.
          </p>


          <form onSubmit={handleLogin}>

            <label>
              Username
            </label>

            <input
              type="text"
              value={username}
              onChange={(event) =>
                setUsername(event.target.value)
              }
              placeholder="Enter username"
              required
            />


            <label>
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Enter password"
              required
            />


            <button type="submit">
              Login
            </button>

          </form>


          {message && (
            <p className="success-message">
              {message}
            </p>
          )}


          {error && (
            <p className="error-message">
              {error}
            </p>
          )}

        </div>

      </div>

    );

  }


  return (

    <div className="dashboard">

      <header className="dashboard-header">

        <div>

          <h1>
            Job Tracker
          </h1>

          <p>
            Welcome, {username || "User"}
          </p>

        </div>

      </header>


      <main className="dashboard-content">


        {message && (
          <p className="success-message">
            {message}
          </p>
        )}


        {error && (
          <p className="error-message">
            {error}
          </p>
        )}


        <section className="card">

          <h2>
            Add Job
          </h2>


          <form
            className="job-form"
            onSubmit={handleAddJob}
          >

            <input
              type="text"
              value={company}
              onChange={(event) =>
                setCompany(event.target.value)
              }
              placeholder="Company"
              required
            />


            <input
              type="text"
              value={jobTitle}
              onChange={(event) =>
                setJobTitle(event.target.value)
              }
              placeholder="Job Title"
              required
            />


            <input
              type="text"
              value={location}
              onChange={(event) =>
                setLocation(event.target.value)
              }
              placeholder="Location"
              required
            />


            <input
              type="url"
              value={jobUrl}
              onChange={(event) =>
                setJobUrl(event.target.value)
              }
              placeholder="Job URL"
              required
            />


            <select
              value={status}
              onChange={(event) =>
                setStatus(event.target.value)
              }
            >

              <option value="Applied">
                Applied
              </option>

              <option value="Interview">
                Interview
              </option>

              <option value="Selected">
                Selected
              </option>

              <option value="Rejected">
                Rejected
              </option>

            </select>


            <input
              type="date"
              value={appliedDate}
              onChange={(event) =>
                setAppliedDate(event.target.value)
              }
              required
            />


            <button type="submit">
              Add Job
            </button>

          </form>

        </section>


        <section className="status-summary">

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


        <section className="card">

          <div className="section-header">

            <h2>
              My Jobs
            </h2>


            <div className="filters">

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search jobs..."
              />


              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
              >

                <option value="All">
                  All
                </option>

                <option value="Applied">
                  Applied
                </option>

                <option value="Interview">
                  Interview
                </option>

                <option value="Selected">
                  Selected
                </option>

                <option value="Rejected">
                  Rejected
                </option>

              </select>

            </div>

          </div>


          <div className="jobs-grid">

            {filteredJobs.length === 0 ? (

              <p>
                No jobs found.
              </p>

            ) : (

              filteredJobs.map((job) => (

                <div
                  className="job-card"
                  key={job.id}
                >

                  <h3>
                    {job.job_title}
                  </h3>

                  <p>
                    <strong>
                      Company:
                    </strong>{" "}
                    {job.company}
                  </p>

                  <p>
                    <strong>
                      Location:
                    </strong>{" "}
                    {job.location}
                  </p>

                  <p>
                    <strong>
                      Status:
                    </strong>{" "}
                    {job.status}
                  </p>

                  <p>
                    <strong>
                      Applied Date:
                    </strong>{" "}
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
                      onClick={() =>
                        handleDeleteJob(job.id)
                      }
                    >
                      Delete
                    </button>

                  </div>

                </div>

              ))

            )}

          </div>

        </section>


        <section className="card external-section">

          <div className="section-header">

            <div>

              <h2>
                External Job Search
              </h2>

              <p>
                Search current job listings from Adzuna.
              </p>

            </div>

          </div>


          <div className="external-search">

            <input
              type="text"
              value={externalSearch}
              onChange={(event) =>
                setExternalSearch(event.target.value)
              }
              placeholder="Search jobs..."
            />


            <button
              onClick={fetchExternalJobs}
              disabled={externalLoading}
            >
              {externalLoading
                ? "Searching..."
                : "Search Jobs"}
            </button>

          </div>


          {externalError && (

            <p className="error-message">
              {externalError}
            </p>

          )}


          <div className="external-jobs-grid">

            {externalJobs.map((job, index) => (

              <div
                className="external-job-card"
                key={job.id || index}
              >

                <h3>
                  {job.title}
                </h3>

                <p>
                  <strong>
                    Company:
                  </strong>{" "}
                  {job.company?.display_name ||
                    "Unknown Company"}
                </p>

                <p>
                  <strong>
                    Location:
                  </strong>{" "}
                  {job.location?.display_name ||
                    "Unknown Location"}
                </p>

                <p>
                  <strong>
                    Category:
                  </strong>{" "}
                  {job.category?.label ||
                    "Not specified"}
                </p>

                <p>
                  {job.description
                    ? job.description.substring(0, 180) +
                      "..."
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
                    className="saved-job-button"
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


          <p className="adzuna-note">
            Job listings provided by Adzuna.
          </p>

        </section>

      </main>

    </div>

  );

}


export default App;