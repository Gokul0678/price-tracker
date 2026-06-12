import { useState, useEffect } from "react"
import axios from "axios"
import ProductList from "./components/ProductList"
import ProductDetail from "./components/ProductDetail"

const API = "http://localhost:3000"

function App() {
  const [products, setProducts] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [])

  async function fetchProducts() {
    try {
      const res = await axios.get(`${API}/products`)
      setProducts(res.data)
    } catch (e) {
      console.error("Could not fetch products:", e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>

      {/* Header */}
      <div style={{
        background: "#2563eb",
        color: "white",
        padding: "16px 32px",
        display: "flex",
        alignItems: "center",
        gap: "12px"
      }}>
        <span style={{ fontSize: "24px" }}>💰</span>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 700 }}>Price Tracker</h1>
          <p style={{ fontSize: "12px", opacity: 0.8 }}>
            Track prices across any e-commerce site
          </p>
        </div>
        <div style={{ marginLeft: "auto", fontSize: "13px", opacity: 0.8 }}>
          {products.length} product{products.length !== 1 ? "s" : ""} tracked
        </div>
      </div>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "24px 16px" }}>

        {/* Back button */}
        {selected && (
          <button
            onClick={() => setSelected(null)}
            style={{
              background: "none",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              padding: "8px 16px",
              cursor: "pointer",
              marginBottom: "20px",
              fontSize: "13px",
              color: "#374151"
            }}
          >
            ← Back to all products
          </button>
        )}

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px", color: "#6b7280" }}>
            Loading products...
          </div>
        ) : selected ? (
          <ProductDetail product={selected} api={API} />
        ) : (
          <ProductList
            products={products}
            onSelect={setSelected}
            onRefresh={fetchProducts}
          />
        )}
      </div>
    </div>
  )
}

export default App