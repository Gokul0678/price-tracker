import axios from "axios"

function ProductCard({ product, onSelect, onDelete }) {
  const latestPrice = product.prices?.[0]?.price ?? "N/A"
  const site = product.site

  return (
    <div style={{
      background: "white",
      border: "1px solid #e2e8f0",
      borderRadius: "12px",
      padding: "20px",
      cursor: "pointer",
      transition: "box-shadow 0.2s",
      display: "flex",
      flexDirection: "column",
      height: "100%",
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)"}
      onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
    >
      {/* Site badge */}
      <div style={{
        fontSize: "11px",
        background: "#eff6ff",
        color: "#2563eb",
        padding: "2px 8px",
        borderRadius: "20px",
        display: "inline-block",
        marginBottom: "10px"
      }}>
        {site}
      </div>

      {/* Product name */}
      <div style={{
        fontSize: "14px",
        fontWeight: 600,
        color: "#1e293b",
        marginBottom: "12px",
        lineHeight: 1.4,
        flexGrow: 1,
      }}>
        {product.name}
      </div>

      {/* Price */}
      <div style={{
        fontSize: "24px",
        fontWeight: 700,
        color: "#16a34a",
        marginBottom: "16px"
      }}>
        ₹{typeof latestPrice === "number" ? latestPrice.toLocaleString() : latestPrice}
      </div>

      {/* Buttons */}
      <div style={{ display: "flex", gap: "8px" }}>
        <button
          onClick={() => onSelect(product)}
          style={{
            flex: 1,
            padding: "8px",
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: 500,
            cursor: "pointer"
          }}
        >
          View History
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(product.id) }}
          style={{
            padding: "8px 12px",
            background: "#fef2f2",
            color: "#dc2626",
            border: "1px solid #fecaca",
            borderRadius: "8px",
            fontSize: "13px",
            cursor: "pointer"
          }}
        >
          🗑
        </button>
      </div>
    </div>
  )
}

function ProductList({ products, onSelect, onRefresh }) {

  async function handleDelete(id) {
    if (!window.confirm("Stop tracking this product?")) return
    try {
      await axios.delete(`https://price-tracker-production-0874.up.railway.app/products/${id}`)
      onRefresh()
    } catch (e) {
      alert("Could not delete product")
    }
  }

  if (products.length === 0) {
    return (
      <div style={{
        textAlign: "center",
        padding: "80px 20px",
        color: "#6b7280"
      }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>📦</div>
        <h2 style={{ fontSize: "18px", marginBottom: "8px", color: "#374151" }}>
          No products tracked yet
        </h2>
        <p style={{ fontSize: "14px" }}>
          Visit any product page and click the Price Tracker extension to start tracking.
        </p>
      </div>
    )
  }

  return (
    <div>
      <h2 style={{
        fontSize: "16px",
        fontWeight: 600,
        color: "#374151",
        marginBottom: "16px"
      }}>
        Tracked Products
      </h2>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: "16px",
        alignItems: "stretch"
      }}>
        {products.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            onSelect={onSelect}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  )
}

export default ProductList
