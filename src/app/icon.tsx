import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0b",
        }}
      >
        <div style={{ display: "flex", position: "relative", width: 26, height: 17 }}>
          <div
            style={{
              position: "absolute",
              left: 0,
              width: 17,
              height: 17,
              borderRadius: "50%",
              border: "1.8px solid #c9a25c",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 9,
              width: 17,
              height: 17,
              borderRadius: "50%",
              border: "1.8px solid #dfbd7f",
            }}
          />
        </div>
      </div>
    ),
    { ...size },
  );
}
