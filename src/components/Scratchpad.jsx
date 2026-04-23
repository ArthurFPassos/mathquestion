import { useRef, useState } from "react";
import { useApp } from "../context/AppContext";
import "./Scratchpad.css";

export default function Scratchpad() {
  const { dispatch } = useApp();
  const canvasRef    = useRef(null);
  const drawing      = useRef(false);
  const lastPos      = useRef(null);
  const [color, setColor] = useState("#1e293b");
  const [size,  setSize]  = useState(3);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const src  = e.touches ? e.touches[0] : e;
    return { x: src.clientX - rect.left, y: src.clientY - rect.top };
  };

  const startDraw = (e) => {
    drawing.current  = true;
    lastPos.current  = getPos(e, canvasRef.current);
  };

  const draw = (e) => {
    if (!drawing.current) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext("2d");
    const pos    = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = color;
    ctx.lineWidth   = size;
    ctx.lineCap     = "round";
    ctx.lineJoin    = "round";
    ctx.stroke();
    lastPos.current = pos;
  };

  const endDraw = () => { drawing.current = false; };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div className="sp-overlay">
      <div className="sp-panel">
        <div className="sp-header">
          <span className="sp-title">✏️ Rascunho</span>
          <div className="sp-controls">
            <label className="sp-label">Cor</label>
            <input
              type="color"
              className="sp-color-picker"
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />
            <label className="sp-label">Espessura</label>
            <select
              className="sp-select"
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
            >
              <option value={2}>Fina</option>
              <option value={4}>Média</option>
              <option value={8}>Grossa</option>
            </select>
            <button className="sp-btn sp-btn--clear" onClick={clearCanvas}>
              Limpar
            </button>
            <button
              className="sp-btn"
              onClick={() => dispatch({ type: "TOGGLE_SCRATCHPAD" })}
            >
              ✕ Fechar
            </button>
          </div>
        </div>

        <canvas
          ref={canvasRef}
          width={560}
          height={280}
          className="sp-canvas"
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
        />
        <p className="sp-hint">Clique e arraste para escrever</p>
      </div>
    </div>
  );
}
