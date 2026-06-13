import { useState } from "react"
import axios from "axios"

function ChatWidget({ product, api }) {
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "Hi! I can answer questions about " + product.name + ". Try asking: 'Is now a good time to buy?' or 'What is the price trend?'"
    }
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)

  async function sendMessage() {
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput("")
    setMessages(prev => [...prev, { role: "user", text: userMessage }])
    setLoading(true)

    try {
      const res = await axios.post(api + "/products/" + product.id + "/chat", {
        message: userMessage
      })
      setMessages(prev => [...prev, { role: "ai", text: res.data.reply }])
    } catch (e) {
      setMessages(prev => [...prev, {
        role: "ai",
        text: "Sorry, I could not connect to the AI. Make sure the backend is running."
      }])
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") sendMessage()
  }

  return (
    <div style={{
      background: "white",
      border: "1px solid #e2e8f0",
      borderRadius: "12px",
      overflow: "hidden",
      marginTop: "16px"
    }}>
      <div style={{
        background: "#2563eb",
        padding: "14px 20px",
        display: "flex",
        alignItems: "center",
        gap: "8px"
      }}>
        <span style={{ fontSize: "18px" }}>🤖</span>
        <div>
          <div style={{ color: "white", fontWeight: 600, fontSize: "14px" }}>
            AI Shopping Assistant
          </div>
          <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "11px" }}>
             Powered by Groq AI
          </div>
        </div>
      </div>

      <div style={{
        height: "280px",
        overflowY: "auto",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "12px"
      }}>
        {messages.map(function(msg, i) {
          const isAi = msg.role === "ai"
          return (
            <div key={i} style={{
              display: "flex",
              justifyContent: isAi ? "flex-start" : "flex-end"
            }}>
              <div style={{
                maxWidth: "80%",
                padding: "10px 14px",
                borderRadius: isAi ? "4px 12px 12px 12px" : "12px 4px 12px 12px",
                background: isAi ? "#f1f5f9" : "#2563eb",
                color: isAi ? "#1e293b" : "white",
                fontSize: "13px",
                lineHeight: 1.5
              }}>
                {msg.text}
              </div>
            </div>
          )
        })}

        {loading && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div style={{
              padding: "10px 14px",
              borderRadius: "4px 12px 12px 12px",
              background: "#f1f5f9",
              color: "#6b7280",
              fontSize: "13px"
            }}>
              Thinking...
            </div>
          </div>
        )}
      </div>

      <div style={{
        padding: "12px 16px",
        borderTop: "1px solid #e2e8f0",
        display: "flex",
        gap: "8px"
      }}>
        <input
          type="text"
          placeholder="Ask anything about this product..."
          value={input}
          onChange={function(e) { setInput(e.target.value) }}
          onKeyDown={handleKeyDown}
          style={{
            flex: 1,
            padding: "10px 12px",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            fontSize: "13px",
            outline: "none"
          }}
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          style={{
            padding: "10px 16px",
            background: loading ? "#93c5fd" : "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: 500,
            cursor: loading ? "not-allowed" : "pointer"
          }}
        >
          Send
        </button>
      </div>
    </div>
  )
}

export default ChatWidget