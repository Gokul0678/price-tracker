import { useState, useEffect } from "react"
import axios from "axios"
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from "recharts"

function StatBox({ label, value, color }) {
  return (
    <div style={{
      background: "white",
      border: "1px solid #e2e8f0",
      borderRadius: "12px",
      padding: "16px",
      textAlign: "center",
      flex: 1
    }}>
      <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "6px" }}>
        {label}
      </div>
      <div style={{ fontSize: "22px", fontWeight: 700, color }}>
        {typeof value === "number" ? "Rs." + value.toLocaleString() : value}
      </div>
    </div>
  )
}

function ProductDetail({ product, api }) {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [alertPrice, setAlertPrice] = useState("")
  const [alertSaved, setAlertSaved] = useState(false)

  useEffect(() => {
    fetchHistory()
  }, [product.id])

  async function fetchHistory() {
    try {
      const res = await axios.get(api + "/products/" + product.id + "/history")
      setHistory(res.data)
    } catch (e) {
      console.error("Could not fetch history:", e)
    } finally {
      setLoading(false)
    }
  }

  async function saveAlert() {
    if (!alertPrice) return
    try {
      await axios.post(api + "/products/" + product.id + "/alerts", {
        targetPrice: parseFloat(alertPrice)
      })
      setAlertSaved(true)
      setAlertPrice("")
    } catch (e) {
      alert("Could not save alert")
    }
  }

  const prices = history.map(function(h) { return h.price })
  const currentPrice = prices.length ? prices[prices.length - 1] : "N/A"
  const lowestPrice = prices.length ? Math.min.apply(null, prices) : "N/A"
  const highestPrice = prices.length ? Math.max.apply(null, prices) : "N/A"

  const chartData = history.map(function(h) {
    return {
      date: new Date(h.scrapedAt).toLocaleDateString(),
      price: h.price
    }
  })

  return (
    <div>
      <div style={{
        background: "white",
        border: "1px solid #e2e8f0",
        borderRadius: "12px",
        padding: "20px",
        marginBottom: "16px"
      }}>
        <div style={{
          fontSize: "11px",
          background: "#eff6ff",
          color: "#2563eb",
          padding: "2px 8px",
          borderRadius: "20px",
          display: "inline-block",
          marginBottom: "8px"
        }}>
          {product.site}
        </div>
        <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#1e293b" }}>
          {product.name}
        </h2>
        
          href={product.url}
          target="_blank"
          rel="noreferrer"
          style={{ fontSize: "12px", color: "#2563eb" }}
        >
          View on site
        </a>
      </div>

      <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
        <StatBox label="Current Price" value={currentPrice} color="#2563eb" />
        <StatBox label="Lowest Ever" value={lowestPrice} color="#16a34a" />
        <StatBox label="Highest Ever" value={highestPrice} color="#dc2626" />
      </div>

      <div style={{
        background: "white",
        border: "1px solid #e2e8f0",
        borderRadius: "12px",
        padding: "20px",
        marginBottom: "16px"
      }}>
        <h3 style={{
          fontSize: "15px",
          fontWeight: 600,
          marginBottom: "16px",
          color: "#374151"
        }}>
          Price History
        </h3>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>
            Loading chart...
          </div>
        ) : chartData.length < 2 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>
            <p>Not enough data for a chart yet.</p>
            <p style={{ fontSize: "12px", marginTop: "8px" }}>
              Come back after the scheduler runs a few times.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" fontSize={11} tick={{ fill: "#6b7280" }} />
              <YAxis
                fontSize={11}
                tick={{ fill: "#6b7280" }}
                tickFormatter={function(v) { return "Rs." + v }}
              />
              <Tooltip
                formatter={function(value) { return ["Rs." + value.toLocaleString(), "Price"] }}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#2563eb"
                strokeWidth={2}
                dot={{ fill: "#2563eb", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div style={{
        background: "white",
        border: "1px solid #e2e8f0",
        borderRadius: "12px",
        padding: "20px"
      }}>
        <h3 style={{
          fontSize: "15px",
          fontWeight: 600,
          marginBottom: "4px",
          color: "#374151"
        }}>
          Set Price Alert
        </h3>
        <p style={{ fontSize: "12px", color: "#6b7280", marginBottom: "12px" }}>
          Get notified when the price drops below your target
        </p>

        {alertSaved ? (
          <div style={{
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            color: "#16a34a",
            padding: "10px",
            borderRadius: "8px",
            fontSize: "13px"
          }}>
            Alert saved! You will be notified when the price drops.
          </div>
        ) : (
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              type="number"
              placeholder="Enter target price e.g. 45"
              value={alertPrice}
              onChange={function(e) { setAlertPrice(e.target.value) }}
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
              onClick={saveAlert}
              style={{
                padding: "10px 20px",
                background: "#2563eb",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: 500,
                cursor: "pointer"
              }}
            >
              Set Alert
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductDetail