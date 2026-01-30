import React, { useEffect, useState } from "react";
import "../css/Notifications.css";
import { getVisitorDashboard,getVisitorProfile } from "../services/api";
import VisitorNavbar from "./VisitorNavbar";
import Header from "../Components/Header";
import NavbarTop from "../Components/NavbarTop";
import "./MainPage.css";
import { useNavigate } from "react-router-dom";

const ITEMS_PER_PAGE = 5;

const Notifications = () => {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
const [visitor, setVisitor] = useState(null);

  const username = localStorage.getItem("username");
useEffect(() => {
  const fetchProfile = async () => {
    try {
      const res = await getVisitorProfile(username);
      if (res.data?.success) {
        setVisitor(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  fetchProfile();
}, [username]);

  /* ================= Date Grouping ================= */
  const getDateGroup = (date) => {
    const today = new Date();
    const d = new Date(date);

    if (d.toDateString() === today.toDateString()) return "Today";

    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";

    return "Older";
  };

  /* ================= Fetch Notifications ================= */
  useEffect(() => {
    if (!username) return;

    const fetchNotifications = async () => {
      setLoading(true);

      const { data, error } = await getVisitorDashboard(username);

      if (error) {
        alert("Failed to fetch notifications");
      } else if (data?.success) {
        setFullName(data.data.full_name || username);

        const formatted = (data.data.notifications || [])
          // newest first
          .sort(
            (a, b) =>
              new Date(b.created_at) - new Date(a.created_at)
          )
          .map((n) => {
            const message = (n.message || "").toLowerCase();

            let type = "info"; // default blue

            if (
              message.includes("cancel") ||
              message.includes("reject")
            )
              type = "error";
            else if (
              message.includes("approve") ||
              message.includes("completed")
            )
              type = "success";
            else if (message.includes("pending"))
              type = "warning";

            return {
              ...n,
              type,
              created_at: n.created_at || new Date(),
            };
          });

        setNotifications(formatted);
        setCurrentPage(1);
      }

      setLoading(false);
    };

    fetchNotifications();
  }, [username]);

  /* ================= Pagination ================= */
  const totalPages = Math.ceil(
    notifications.length / ITEMS_PER_PAGE
  );

  const paginatedNotifications = notifications.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  /* ================= Grouped Notifications ================= */
  const groupedNotifications = paginatedNotifications.reduce(
    (groups, note) => {
      const group = getDateGroup(note.created_at);
      if (!groups[group]) groups[group] = [];
      groups[group].push(note);
      return groups;
    },
    {}
  );

  if (loading) {
    return <p className="empty">Loading notifications…</p>;
  }

  return (
    <>
      {/* Fixed Header */}
      <div className="fixed-header">
        <NavbarTop />
        <Header />
       <VisitorNavbar
  fullName={fullName}
  photo={visitor?.photo || visitor?.photo_url}
/>
      </div>

      <div className="main-layout">
        <div className="content-below">
          <div className="notifications-container">
            {/* Page Header */}
            <h2>
              <button
                className="back-btn"
                onClick={() => navigate(-1)}
              >
                ← Back
              </button>{" "}
              🔔 Notifications
            </h2>

            {notifications.length === 0 ? (
              <p className="empty">No notifications yet.</p>
            ) : (
              <>
                {Object.entries(groupedNotifications).map(
                  ([groupName, notes]) => (
                    <div
                      key={groupName}
                      className="date-group"
                    >
                      <h4 className="date-heading">
                        {groupName}
                      </h4>

                      <ul className="notification-list">
                        {notes.map((note, index) => (
                          <li
                            key={index}
                            className={`notification ${note.type}`}
                          >
                            <p>{note.message}</p>
                            <span className="time">
                              {new Date(
                                note.created_at
                              ).toLocaleTimeString()}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="pagination">
                    <button
                      disabled={currentPage === 1}
                      onClick={() =>
                        setCurrentPage((p) => p - 1)
                      }
                    >
                      ◀ Prev
                    </button>

                    <span className="page-info">
                      Page {currentPage} of {totalPages}
                    </span>

                    <button
                      disabled={
                        currentPage === totalPages
                      }
                      onClick={() =>
                        setCurrentPage((p) => p + 1)
                      }
                    >
                      Next ▶
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Notifications;
