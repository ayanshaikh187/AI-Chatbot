import { useEffect, useState } from "react";
import { ArrowLeft, Save, User } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
    const { user, updateUser } = useAuth();

    const [name, setName] = useState(user?.name || "");
    const [avatar, setAvatar] = useState(user?.avatar || "");
    const [msg, setMsg] = useState("");
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        setName(user?.name || "");
        setAvatar(user?.avatar || "");
    }, [user]);

    const save = async (e) => {
        e.preventDefault();

        setBusy(true);
        setMsg("");

        try {
            const { data } = await api.put("/users/profile", {
                name,
                avatar,
            });

            const updatedUser = data.data.user;

            // Update AuthContext + localStorage
            updateUser(updatedUser);

            // Update local form state
            setName(updatedUser.name || "");
            setAvatar(updatedUser.avatar || "");

            setMsg("Profile updated successfully.");
        } catch (err) {
            setMsg(
                err.response?.data?.message || "Update failed."
            );
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="profile-page">
            <div className="profile-card">

                {/* Back */}
                <Link to="/chat" className="back-link">
                    <ArrowLeft size={17} />
                    Back to chat
                </Link>

                {/* Profile Header */}
                <div className="profile-title">

                    <div className="large-avatar">
                        {avatar ? (
                            <img
                                src={avatar}
                                alt={name || "Profile"}
                                className="profile-avatar-image"
                            />
                        ) : (
                            name?.[0]?.toUpperCase() || <User size={28} />
                        )}
                    </div>

                    <div>
                        <h1>Your profile</h1>
                        <p>Manage your account details.</p>
                    </div>

                </div>

                {/* Form */}
                <form className="form" onSubmit={save}>

                    {/* Name */}
                    <label>
                        Name

                        <div className="field">
                            <User size={18} />

                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                    </label>

                    {/* Email */}
                    <label>
                        Email

                        <div className="field disabled-field">
                            <input
                                value={user?.email || ""}
                                disabled
                            />
                        </div>
                    </label>

                    {/* Avatar URL */}
                    <label>
                        Avatar URL

                        <div className="field">
                            <input
                                type="url"
                                value={avatar}
                                onChange={(e) => setAvatar(e.target.value)}
                                placeholder="https://..."
                            />
                        </div>
                    </label>

                    {/* Preview */}
                    {avatar && (
                        <div style={{ marginTop: "12px" }}>
                            <p
                                style={{
                                    fontSize: "13px",
                                    marginBottom: "8px",
                                    opacity: 0.7,
                                }}
                            >
                                Avatar Preview
                            </p>

                            <img
                                src={avatar}
                                alt="Avatar preview"
                                style={{
                                    width: "80px",
                                    height: "80px",
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                    border: "2px solid rgba(255,255,255,0.15)",
                                }}
                                onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                }}
                            />
                        </div>
                    )}

                    {/* Message */}
                    {msg && (
                        <div className="success-box">
                            {msg}
                        </div>
                    )}

                    {/* Save */}
                    <button
                        className="primary-btn"
                        disabled={busy}
                        type="submit"
                    >
                        <Save size={17} />

                        {busy ? "Saving..." : "Save changes"}
                    </button>

                </form>
            </div>
        </div>
    );
}