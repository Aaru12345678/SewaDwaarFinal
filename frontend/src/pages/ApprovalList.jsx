import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  fetchSchemes,
  fetchApprovalData,
  approveData,
  rejectData,
} from "../services/api1";

export default function ApprovalList() {
  const [schemes, setSchemes] = useState([]);
  const [selectedScheme, setSelectedScheme] = useState("");
  const [approvalData, setApprovalData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rejectRemarks, setRejectRemarks] = useState({}); // store remarks per row

  // Load schemes
  useEffect(() => {
    fetchSchemes()
      .then(({ data }) => setSchemes(data))
      .catch(() => toast.error("Failed to load schemes"));
  }, []);

  // Fetch approval data for scheme
  const loadApprovalData = async (schemeCode) => {
  setSelectedScheme(schemeCode);
  if (!schemeCode) return;

  setLoading(true);
  try {
    const res = await fetchApprovalData(schemeCode);
    console.log(res);
    if (res.data.success) {
      setApprovalData(res.data.data || []);
    } else {
      setApprovalData([]);
      toast.error(res.data.error || "Failed to fetch data");
    }
  } catch (err) {
    setApprovalData([]);
    toast.error("Error fetching data");
  } finally {
    setLoading(false); // ✅ Always stop loading
  }
};


  // Approve handler
  const handleApprove = async (row) => {
    try {
      await approveData(row.id);
      toast.success(`Approved ID ${row.id}`);
      loadApprovalData(selectedScheme); // refresh
    } catch {
      toast.error("Failed to approve");
    }
  };

  // Reject handler
  const handleReject = async (row) => {
    const remark = rejectRemarks[row.id]?.trim();
    if (!remark) {
      toast.error("Please enter rejection remark");
      return;
    }
    try {
      await rejectData(row.id, remark);
      toast.success(`Rejected ID ${row.id}`);
      loadApprovalData(selectedScheme);
    } catch {
      toast.error("Failed to reject");
    }
  };

  return (
    <div className="container">
      <h2>Approval Management</h2>

      {/* Scheme dropdown */}
      <label>Select Scheme</label>
      <select
        value={selectedScheme}
        onChange={(e) => loadApprovalData(e.target.value)}
      >
        <option value="">-- Select Scheme --</option>
        {schemes.map((s) => (
          <option key={s.scheme_code} value={s.scheme_code}>
            {s.scheme_name}
          </option>
        ))}
      </select>

      {loading && <p>Loading...</p>}

      {/* Table */}
      {approvalData.length > 0 && (
        <table border="1" cellPadding="8" style={{ marginTop: "20px", width: "100%" }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>User Code</th>
              <th>User Division Code</th>
              <th>Scheme Code</th>
              <th>Data</th>
              <th>Approve</th>
              <th>Reject</th>
            </tr>
          </thead>
          <tbody>
            {approvalData.map((row) => (
              <tr key={row.id}>
                <td>{row.id}</td>
                <td>{row.user_code}</td>
                <td>{row.user_division_code}</td>
                <td>{row.scheme_code}</td>
                <td>
                  <pre style={{ whiteSpace: "pre-wrap" }}>
                    {JSON.stringify(row.data, null, 2)}
                  </pre>
                </td>
                <td>
                  <button onClick={() => handleApprove(row)}>Approve</button>
                </td>
                <td>
                  <input
                    type="text"
                    placeholder="Remark"
                    value={rejectRemarks[row.id] || ""}
                    onChange={(e) =>
                      setRejectRemarks({
                        ...rejectRemarks,
                        [row.id]: e.target.value,
                      })
                    }
                  />
                  <button onClick={() => handleReject(row)}>Reject</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selectedScheme && approvalData.length === 0 && !loading && (
        <p>No pending approvals for this scheme.</p>
      )}
    </div>
  );
}
