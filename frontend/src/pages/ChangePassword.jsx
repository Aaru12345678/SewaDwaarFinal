import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { changePassword } from '../services/api';
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import "../css/ChangePass.css"
export default function ChangePassword() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      toast.error(
        "Password must be 8+ characters with 1 uppercase, 1 digit, and 1 special character."
      );
      return;
    }

    const user_id = localStorage.getItem("user_id");
    if (!user_id) {
      toast.error("Session expired. Please login again.");
      localStorage.clear();
      navigate("/login");
      return;
    }

    try {
      const { data } = await changePassword({
        user_id,
        old_password: oldPassword.trim(),
        new_password: newPassword.trim(),
      });

      if (!data.success) {
        toast.error(data.message || "Password change failed");
        return;
      }

      toast.success("Password changed successfully");
      localStorage.setItem("is_first_login", "false");
      navigate("/login");

    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    }
  };

  const EyeButton = ({ show, toggle }) => (
    <button
      type="button"
      onClick={toggle}
      className="eye-btn"
    >
      {show ? <AiOutlineEye /> : <AiOutlineEyeInvisible />}
    </button>
  );

  return (
    <div className="container">
      <div className="login-box">
        <h2>Change Password</h2>

        <form className="form" onSubmit={handleSubmit}>

          {/* Old Password */}
          <label>Old Password</label>
          <div className="password-wrapper">
            <input
              type={showOld ? "text" : "password"}
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
            />
            <EyeButton show={showOld} toggle={() => setShowOld(!showOld)} />
          </div>

          {/* New Password */}
          <label>New Password</label>
          <div className="password-wrapper">
            <input
              type={showNew ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <EyeButton show={showNew} toggle={() => setShowNew(!showNew)} />
          </div>

          {/* Confirm Password */}
          <label>Confirm New Password</label>
          <div className="password-wrapper">
            <input
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <EyeButton show={showConfirm} toggle={() => setShowConfirm(!showConfirm)} />
          </div>

          <button type="submit" className="submit-btn">
            Change Password
          </button>

        </form>
      </div>
    </div>
  );
}
