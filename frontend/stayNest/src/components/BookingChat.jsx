import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { io } from "socket.io-client";

const API_URL = import.meta.env.VITE_API_URL;

const BookingChat = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [booking, setBooking] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const scrollRef = useRef(null);
  const socketRef = useRef(null);

  const token = localStorage.getItem("token");

  const otherParticipant = useMemo(() => {
    if (!booking || !user) return null;

    const guestId = booking?.guest?._id;
    const hostId = booking?.host?._id;

    if (String(user._id) === String(guestId)) return booking?.host;
    if (String(user._id) === String(hostId)) return booking?.guest;
    return null;
  }, [booking, user]);

  const fetchMessages = useCallback(
    async ({ initial = false } = {}) => {
      try {
        if (initial) {
          setLoading(true);
        }

        const response = await fetch(
          `${API_URL}/messages/booking/${bookingId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to fetch messages");
        }

        setBooking(data.booking);
        setMessages(Array.isArray(data.messages) ? data.messages : []);
        setError("");
      } catch (err) {
        setError(err.message || "Unable to load chat");
      } finally {
        if (initial) {
          setLoading(false);
        }
      }
    },
    [bookingId, token],
  );

  const markAsRead = useCallback(async () => {
    try {
      await fetch(`${API_URL}/messages/booking/${bookingId}/read`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (err) {
      // Non-blocking call; ignore to avoid noisy UX
      console.error("Failed to mark messages as read:", err);
    }
  }, [bookingId, token]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    fetchMessages({ initial: true });
  }, [user, navigate, fetchMessages]);

  useEffect(() => {
    if (!user || !token) return;

    const socket = io(API_URL.replace(/\/api$/, ""), {
      auth: {
        token,
      },
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("chat:join-booking", bookingId);
    });

    socket.on("chat:new-message", (incomingMessage) => {
      if (!incomingMessage?._id) return;
      setMessages((prev) => {
        const exists = prev.some((msg) => msg._id === incomingMessage._id);
        if (exists) return prev;
        return [...prev, incomingMessage];
      });
    });

    socket.on("chat:error", (message) => {
      setError(message || "Chat connection error");
    });

    socket.on("connect_error", (err) => {
      setError(err?.message || "Unable to establish chat connection");
    });

    return () => {
      socket.emit("chat:leave-booking", bookingId);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [bookingId, user, token]);

  useEffect(() => {
    if (!loading) {
      markAsRead();
    }
  }, [loading, markAsRead]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    const content = draft.trim();

    if (!content || sending) return;

    try {
      setSending(true);

      const response = await fetch(`${API_URL}/messages/booking/${bookingId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to send message");
      }

      setDraft("");
      setError("");
    } catch (err) {
      setError(err.message || "Unable to send message");
    } finally {
      setSending(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    await sendMessage();
  };

  const handleDraftKeyDown = async (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      await sendMessage();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link
              to={`/booking/${bookingId}`}
              className="inline-flex items-center text-blue-600 hover:text-blue-700"
            >
              <span className="mr-2">←</span> Back to Booking
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 mt-2">
              Booking Chat
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              {booking?.property?.title || "Property"}
              {otherParticipant?.name
                ? ` • Chat with ${otherParticipant.name}`
                : ""}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <div
            ref={scrollRef}
            className="h-[60vh] overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-gray-50 to-white"
          >
            {messages.length === 0 && (
              <div className="h-full flex items-center justify-center text-gray-500 text-sm">
                Start the conversation about this booking.
              </div>
            )}

            {messages.map((msg) => {
              const mine = String(msg?.sender?._id) === String(user?._id);
              return (
                <div
                  key={msg._id}
                  className={`flex ${mine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 shadow-sm ${
                      mine
                        ? "bg-blue-600 text-white rounded-br-md"
                        : "bg-white border text-gray-800 rounded-bl-md"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {msg.content}
                    </p>
                    <p
                      className={`mt-1 text-[11px] ${mine ? "text-blue-100" : "text-gray-500"}`}
                    >
                      {new Date(msg.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <form onSubmit={handleSend} className="border-t p-3 bg-white">
            <div className="flex items-end gap-2">
              <textarea
                rows={2}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={handleDraftKeyDown}
                placeholder="Type your message..."
                className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={2000}
              />
              <button
                type="submit"
                disabled={sending || !draft.trim()}
                className="rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? "Sending..." : "Send"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookingChat;
