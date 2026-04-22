import { useRef, useState } from "react";
import { useApp } from "../context/AppContext";

export default function Scratchpad() {
  const { dispatch } = useApp();
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const lastPos = useRef(null);
  const [color, setColor] = useState("#1e293b");
  const [size, setSize] = useState(3);

  

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const src = e.touches ? e.touches[0] : e;
    return { x: src.clientX - rect.left, y: src.clientY - rect.top };
  };

  const startDraw = (e) => {
    drawing.current = true;
    lastPos.current = getPos(e, canvasRef.current);
  };

  const draw = (e) => {
    if (!drawing.current) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    lastPos.current = pos;
  };

  const endDraw = () => {
    drawing.current = false;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
  };

  

  return (
    <div style={styles.overlay}>
      <div style={styles.panel}>
        {}
        <div style={styles.header}>
          <span style={styles.title}>✏️ Rascunho</span>
          <div style={styles.controls}>
            <label style={styles.label}>Cor</label>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              style={styles.colorPicker}
            />

            <label style={styles.label}>Espessura</label>
            <select
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              style={styles.select}
            >
              <option value={2}>Fina</option>
              <option value={4}>Média</option>
              <option value={8}>Grossa</option>
            </select>

            <button
              onClick={clearCanvas}
              style={{ ...styles.btn, background: "#fee2e2", color: "#ef4444" }}
            >
              Limpar
            </button>
            <button
              onClick={() => dispatch({ type: "TOGGLE_SCRATCHPAD" })}
              style={styles.btn}
            >
              ✕ Fechar
            </button>
          </div>
        </div>

        {}
        <canvas
          ref={canvasRef}
          width={560}
          height={280}
          style={styles.canvas}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
        />
        <p style={styles.hint}>Clique e arraste para escrever</p>
      </div>
    </div>
  );
}



const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
    zIndex: 1000,
    padding: 16,
  },
  panel: {
    background: "#fff",
    borderRadius: "16px 16px 0 0",
    padding: 16,
    width: "100%",
    maxWidth: 608,
    boxShadow: "0 -8px 32px rgba(0,0,0,0.14)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  title: {
    fontWeight: 700,
    fontSize: 15,
    color: "#1e293b",
  },
  controls: {
    display: "flex",
    gap: 8,
    alignItems: "center",
    flexWrap: "wrap",
  },
  label: {
    fontSize: 12,
    color: "#64748b",
  },
  colorPicker: {
    width: 30,
    height: 30,
    border: "none",
    padding: 0,
    cursor: "pointer",
    borderRadius: 6,
    background: "transparent",
  },
  select: {
    padding: "4px 8px",
    borderRadius: 8,
    border: "1px solid #e2e8f0",
    background: "#f8fafc",
    fontSize: 13,
    fontFamily: "inherit",
    cursor: "pointer",
  },
  btn: {
    padding: "5px 12px",
    borderRadius: 8,
    border: "1px solid #e2e8f0",
    background: "#f8fafc",
    color: "#475569",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  canvas: {
    background: "#fffef0",
    display: "block",
    cursor: "crosshair",
    touchAction: "none",
    borderRadius: 10,
    border: "1.5px dashed #e2e8f0",
    width: "100%",
    maxWidth: 560,
  },
  hint: {
    fontSize: 11,
    color: "#94a3b8",
    textAlign: "center",
    marginTop: 6,
  },
};





