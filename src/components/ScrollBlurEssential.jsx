import React from "react";

const BLUR = 12;
const LAYERS = 6;

export default function ScrollBlurEssential(props) {
  const { direction = "bottom" } = props;

  const gradientDir = direction === "top" ? "to bottom" : "to top";
  const layers = [];
  const step = 100 / LAYERS;
  
  for (let i = 0; i < LAYERS; i++) {
    const b = (BLUR * (i + 1)) / LAYERS;
    const coverTop = 100 - i * step;
    const fadeStart = Math.max(0, coverTop - step);
    
    // We use rgba(0,0,0,1) for the mask to ensure compatibility
    const mask = `linear-gradient(${gradientDir}, rgba(0,0,0,1) 0%, rgba(0,0,0,1) ${fadeStart}%, rgba(0,0,0,0) ${coverTop}%)`;
    
    // Hardcode the full blur value instead of relying on an animated CSS variable
    const filter = `blur(${b}px)`;
    
    layers.push(
      <div
        key={i}
        style={{
          position: "absolute",
          inset: 0,
          backdropFilter: filter,
          WebkitBackdropFilter: filter,
          WebkitMaskImage: mask,
          maskImage: mask,
          pointerEvents: "none",
        }}
      />
    );
  }
  
  const containerStyle = {
    position: "relative",
    width: "100%",
    height: "100%",
    overflow: "hidden",
    pointerEvents: "none",
  };
  
  return (
    <div style={containerStyle}>
      {layers}
    </div>
  );
}
