import { Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function MessageBubble({ message }) {
  const user = message.role === "user";

  return (
    <div
      className={`message-row ${
        user ? "user-row" : "assistant-row"
      }`}
    >
      {/* Avatar */}
      <div
        className={`message-avatar ${
          user ? "user-avatar" : "bot-avatar"
        }`}
      >
        {user ? (
          <User size={17} />
        ) : (
          <Bot size={17} />
        )}
      </div>

      {/* Message */}
      <div
        className={`message-bubble ${
          user
            ? "user-bubble"
            : "assistant-bubble"
        }`}
      >
        {/* Uploaded Image */}
        {message.imageUrl && (
          <div className="message-image-wrapper">
            <img
              src={message.imageUrl}
              alt="Uploaded"
              className="message-image"
              onClick={() =>
                window.open(
                  message.imageUrl,
                  "_blank"
                )
              }
            />
          </div>
        )}

        {/* Text */}
        {message.content && (
          <div className="message-text">
            <ReactMarkdown>
              {message.content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}