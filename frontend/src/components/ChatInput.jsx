import { ArrowUp, Paperclip, X, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import api from "../services/api";

export default function ChatInput({ onSend, disabled }) {
  const [value, setValue] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef(null);

  // ==============================
  // OPEN FILE PICKER
  // ==============================
  const handleFileClick = () => {
    if (disabled || uploading) return;

    fileInputRef.current?.click();
  };

  // ==============================
  // SELECT IMAGE
  // ==============================
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5MB.");
      return;
    }

    setSelectedFile(file);

    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
  };

  // ==============================
  // REMOVE IMAGE
  // ==============================
  const removeFile = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setSelectedFile(null);
    setPreview("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ==============================
  // SEND MESSAGE
  // ==============================
  const submit = async (e) => {
    e.preventDefault();

    const text = value.trim();

    if ((!text && !selectedFile) || disabled || uploading) {
      return;
    }

    try {
      let imageUrl = "";

      // ==============================
      // UPLOAD IMAGE
      // ==============================
      if (selectedFile) {
        setUploading(true);

        const formData = new FormData();

        formData.append("image", selectedFile);

        const { data } = await api.post(
          "/uploads/image",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        imageUrl = data.data.url;

        setUploading(false);
      }

      // ==============================
      // SEND TO CHAT
      // ==============================
      onSend(text, imageUrl);

      setValue("");
      removeFile();

    } catch (error) {
      console.error("Image upload error:", error);

      setUploading(false);

      alert(
        error.response?.data?.message ||
          "Image upload failed."
      );
    }
  };

  return (
    <form
      className="chat-input-wrap"
      onSubmit={submit}
    >
      {/* IMAGE PREVIEW */}
      {preview && (
        <div
          style={{
            position: "relative",
            width: "90px",
            height: "90px",
            marginBottom: "10px",
          }}
        >
          <img
            src={preview}
            alt="Selected"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: "12px",
            }}
          />

          <button
            type="button"
            onClick={removeFile}
            disabled={uploading}
            style={{
              position: "absolute",
              top: "-7px",
              right: "-7px",
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div className="input-box">

        {/* HIDDEN FILE INPUT */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />

        {/* ATTACHMENT BUTTON */}
        <button
          type="button"
          className="input-tool"
          title="Attach image"
          onClick={handleFileClick}
          disabled={disabled || uploading}
        >
          {uploading ? (
            <Loader2
              size={18}
              className="animate-spin"
            />
          ) : (
            <Paperclip size={18} />
          )}
        </button>

        {/* MESSAGE */}
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (
              e.key === "Enter" &&
              !e.shiftKey
            ) {
              e.preventDefault();
              submit(e);
            }
          }}
          placeholder="Message NeuroChat..."
          rows="1"
          disabled={disabled || uploading}
        />

        {/* SEND */}
        <button
          type="submit"
          className="send-btn"
          disabled={
            disabled ||
            uploading ||
            (!value.trim() && !selectedFile)
          }
        >
          {uploading ? (
            <Loader2
              size={19}
              className="animate-spin"
            />
          ) : (
            <ArrowUp size={19} />
          )}
        </button>

      </div>

      <span className="input-hint">
        Enter to send · Shift + Enter for a new line
      </span>
    </form>
  );
}