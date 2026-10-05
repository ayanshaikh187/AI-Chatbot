import { useEffect, useRef, useState } from "react";
import { Menu, Sparkles } from "lucide-react";
import Sidebar from "../components/Sidebar";
import MessageBubble from "../components/MessageBubble";
import Typing from "../components/Typing";
import ChatInput from "../components/ChatInput";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Chat() {
  const { user } = useAuth();

  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  const bottom = useRef(null);

  const scroll = () =>
    setTimeout(() => {
      bottom.current?.scrollIntoView({
        behavior: "smooth",
      });
    }, 30);

  const loadConversations = async () => {
    try {
      const { data } = await api.get("/chats");

      setConversations(
        data.data.conversations || []
      );
    } catch (e) {
      setError(
        e.response?.data?.message ||
          "Could not load conversations."
      );
    }
  };

  const loadConversation = async (id) => {
    setActiveId(id);
    setMobileOpen(false);
    setError("");

    try {
      const { data } = await api.get(
        `/chats/${id}`
      );

      setMessages(
        data.data.messages || []
      );

      scroll();
    } catch (e) {
      setError(
        e.response?.data?.message ||
          "Could not load chat."
      );
    }
  };

  useEffect(() => {
    loadConversations().finally(() =>
      setLoading(false)
    );
  }, []);

  const newChat = async () => {
    setError("");

    try {
      const { data } = await api.post("/chats");

      const conversation =
        data.data.conversation;

      setConversations((prev) => [
        conversation,
        ...prev,
      ]);

      setActiveId(conversation._id);
      setMessages([]);
      setMobileOpen(false);
    } catch (e) {
      setError(
        e.response?.data?.message ||
          "Could not create chat."
      );
    }
  };

  const deleteChat = async (id) => {
    if (!confirm("Delete this conversation?")) {
      return;
    }

    try {
      await api.delete(`/chats/${id}`);

      setConversations((prev) =>
        prev.filter((c) => c._id !== id)
      );

      if (activeId === id) {
        setActiveId(null);
        setMessages([]);
      }
    } catch (e) {
      setError(
        e.response?.data?.message ||
          "Could not delete chat."
      );
    }
  };

  // ============================
  // SEND TEXT / IMAGE MESSAGE
  // ============================

  const send = async (content, imageUrl = "") => {
    let id = activeId;

    // Create conversation if there isn't one
    if (!id) {
      try {
        const { data } = await api.post(
          "/chats"
        );

        id = data.data.conversation._id;

        setActiveId(id);

        setConversations((prev) => [
          data.data.conversation,
          ...prev,
        ]);
      } catch (e) {
        setError(
          "Could not start a conversation."
        );
        return;
      }
    }

    // Optimistic message
    const optimistic = {
      _id: `temp-${Date.now()}`,
      role: "user",
      content: content || "",
      imageUrl: imageUrl || "",
    };

    setMessages((prev) => [
      ...prev,
      optimistic,
    ]);

    setSending(true);
    setError("");

    scroll();

    try {
      const { data } = await api.post(
        "/chats/message",
        {
          conversationId: id,
          content: content || "",
          imageUrl: imageUrl || "",
        }
      );

      setMessages((prev) => [
        ...prev.filter(
          (m) => m._id !== optimistic._id
        ),
        data.data.userMessage,
        data.data.assistantMessage,
      ]);

      await loadConversations();

      scroll();
    } catch (e) {
      setMessages((prev) =>
        prev.filter(
          (m) => m._id !== optimistic._id
        )
      );

      setError(
        e.response?.data?.message ||
          "AI response failed. Please try again."
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="chat-page">
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        onSelect={loadConversation}
        onNew={newChat}
        onDelete={deleteChat}
        mobileOpen={mobileOpen}
        onClose={() =>
          setMobileOpen(false)
        }
      />

      <main className="chat-main">
        <header className="chat-header">
          <button
            className="icon-btn menu-btn"
            onClick={() =>
              setMobileOpen(true)
            }
          >
            <Menu size={22} />
          </button>

          <div>
            <strong>
              {activeId
                ? conversations.find(
                    (c) =>
                      c._id === activeId
                  )?.title || "Chat"
                : "NeuroChat"}
            </strong>

            <span>
              <i className="online-dot" />
              AI assistant
            </span>
          </div>

          <div className="header-user">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name || "User"}
                className="header-user-image"
              />
            ) : (
              user?.name
                ?.slice(0, 1)
                .toUpperCase() || "U"
            )}
          </div>
        </header>

        {error && (
          <div className="chat-error">
            {error}
          </div>
        )}

        <section className="messages-area">
          {loading ? (
            <div className="empty-chat">
              <div className="hero-icon">
                <Sparkles />
              </div>

              <h2>
                Loading your workspace...
              </h2>
            </div>
          ) : messages.length === 0 ? (
            <div className="empty-chat">
              <div className="hero-icon">
                <Sparkles />
              </div>

              <h1>
                How can I help you?
              </h1>

              <p>
                Ask anything. Get clear
                answers, ideas, explanations,
                or code.
              </p>

              <div className="suggestions">
                <button
                  onClick={() =>
                    send(
                      "Explain React.js in simple words"
                    )
                  }
                >
                  Explain React.js simply
                </button>

                <button
                  onClick={() =>
                    send(
                      "Give me a JavaScript project idea"
                    )
                  }
                >
                  Give me a project idea
                </button>

                <button
                  onClick={() =>
                    send(
                      "Help me debug my code"
                    )
                  }
                >
                  Help me debug code
                </button>
              </div>
            </div>
          ) : (
            <div className="messages-list">
              {messages.map((message) => (
                <MessageBubble
                  key={message._id}
                  message={message}
                />
              ))}

              {sending && <Typing />}

              <div ref={bottom} />
            </div>
          )}
        </section>

        <div className="composer">
          <ChatInput
            onSend={send}
            disabled={sending}
          />

          <p className="disclaimer">
            NeuroChat can make mistakes.
            Check important information.
          </p>
        </div>
      </main>
    </div>
  );
}