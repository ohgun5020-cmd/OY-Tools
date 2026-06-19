import { ImageResponse } from "next/og"

export const alt = "PIGER - PSD to Figma and Figma to PSD plugin"
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = "image/png"

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "#050505",
          color: "white",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          justifyContent: "center",
          padding: "72px",
          width: "100%",
        }}
      >
        <div style={{ color: "#6ea8ff", fontSize: 28, fontWeight: 800, letterSpacing: 3 }}>PIGER</div>
        <div
          style={{
            fontSize: 76,
            fontWeight: 900,
            lineHeight: 1.05,
            marginTop: 28,
            maxWidth: 980,
            textAlign: "center",
          }}
        >
          PSD to editable Figma. Figma to PSD-ready output.
        </div>
        <div
          style={{
            color: "rgba(255,255,255,0.72)",
            fontSize: 28,
            fontWeight: 700,
            lineHeight: 1.35,
            marginTop: 34,
            maxWidth: 880,
            textAlign: "center",
          }}
        >
          Conversion, cleanup, AI typo checks, image tools, and design workflow automation.
        </div>
      </div>
    ),
    size,
  )
}
