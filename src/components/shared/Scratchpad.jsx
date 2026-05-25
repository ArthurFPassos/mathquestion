import { useRef, useState, useImperativeHandle, forwardRef, useCallback } from "react";
import { useApp } from "../../context/AppContext";
import "./Scratchpad.css";

const Scratchpad = forwardRef(function Scratchpad({ visible = true }, ref) {
  const { dispatch } = useApp();
  const canvasRef  = useRef(null);
  const drawing    = useRef(false);
  const lastPos    = useRef(null);

  const [color,      setColor]      = useState("#1e293b");
  const [size,       setSize]       = useState(3);
  const [tool,       setTool]       = useState("pen");   
  const [hasContent, setHasContent] = useState(false);
  const [history,    setHistory]    = useState([]);      
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [saveFlash,  setSaveFlash]  = useState(false);

  useImperativeHandle(ref, () => ({
    getSnapshot: () => {
      if (!hasContent || !canvasRef.current) return null;
      try { return canvasRef.current.toDataURL("image/png"); } catch { return null; }
    },
    clear: () => {
      if (!canvasRef.current) return;
      canvasRef.current.getContext("2d")
        .clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      setHasContent(false);
    },
  }));

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    
    const scaleX = canvas.width  / rect.width;
    const scaleY = canvas.height / rect.height;
    const src = e.touches ? e.touches[0] : e;
    return {
      x: (src.clientX - rect.left) * scaleX,
      y: (src.clientY - rect.top)  * scaleY,
    };
  };

  const startDraw = useCallback((e) => {
    drawing.current = true;
    lastPos.current = getPos(e, canvasRef.current);
  }, []);

  const draw = useCallback((e) => {
    if (!drawing.current) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext("2d");
    const pos    = getPos(e, canvas);

    if (tool === "eraser") {
      ctx.clearRect(pos.x - 10, pos.y - 10, 20, 20);
    } else {
      ctx.beginPath();
      ctx.moveTo(lastPos.current.x, lastPos.current.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.strokeStyle = color;
      ctx.lineWidth   = size;
      ctx.lineCap     = "round";
      ctx.lineJoin    = "round";
      ctx.stroke();
    }
    lastPos.current = pos;
    setHasContent(true);
  }, [color, size, tool]);

  const endDraw = useCallback(() => { drawing.current = false; }, []);

  const clearCanvas = () => {
    if (!canvasRef.current) return;
    canvasRef.current.getContext("2d")
      .clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setHasContent(false);
  };

  const saveToHistory = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL("image/png");
    const id      = Date.now();
    const label   = `Rascunhar
     ${history.length + 1}`;
    setHistory((prev) => [...prev, { id, dataUrl, label }]);
    setSidebarOpen(true);
    
    setSaveFlash(true);
    setTimeout(() => setSaveFlash(false), 900);
  };

  const restoreFromHistory = (dataUrl) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const img = new Image();
    img.onload = () => { ctx.drawImage(img, 0, 0); setHasContent(true); };
    img.src = dataUrl;
  };

  const removeFromHistory = (id, e) => {
    e.stopPropagation();
    setHistory((prev) => prev.filter((h) => h.id !== id));
  };

  if (!visible) {
    return (
      <canvas
        ref={canvasRef}
        width={560}
        height={280}
        style={{ display: "none" }}
        aria-hidden="true"
      />
    );
  }

  return (
    <div className="sp-overlay" role="dialog" aria-label="Área de rascunhar
    ">
      <div className={`sp-panel${sidebarOpen ? " sp-panel--with-sidebar" : ""}`}>

        {}
        <div className="sp-header">
          <div className="sp-header-left">
            <span className="sp-title">✏️ Rascunhar
              
            </span>
            {hasContent && !saveFlash && (
              <span className="sp-content-badge">● Em uso</span>
            )}
            {saveFlash && (
              <span className="sp-saved-flash">✓ Salvo!</span>
            )}
          </div>

          <div className="sp-controls">
            {}
            <div className="sp-tool-toggle">
              <button
                className={`sp-tool-btn${tool === "pen" ? " sp-tool-btn--active" : ""}`}
                onClick={() => setTool("pen")}
                title="Caneta"
              >✒️</button>
              <button
                className={`sp-tool-btn${tool === "eraser" ? " sp-tool-btn--active" : ""}`}
                onClick={() => setTool("eraser")}
                title="Borracha"
              >🧹</button>
            </div>

            {}
            <div className="sp-control-group">
              <label className="sp-label">Cor</label>
              <input
                type="color"
                className="sp-color-picker"
                value={color}
                onChange={(e) => { setColor(e.target.value); setTool("pen"); }}
                disabled={tool === "eraser"}
              />
            </div>

            {}
            <div className="sp-control-group">
              <label className="sp-label">Tamanho</label>
              <select
                className="sp-select"
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
              >
                <option value={2}>Fina</option>
                <option value={4}>Média</option>
                <option value={8}>Grossa</option>
              </select>
            </div>

            {}
            <button
              className={`sp-btn sp-btn--save${saveFlash ? " sp-btn--save-flash" : ""}`}
              onClick={saveToHistory}
              disabled={!hasContent}
              title="Guardar cópia deste rascunhar
               no histórico"
            >
              💾 Salvar Rascunhar
              
            </button>

            <button
              className={`sp-btn sp-btn--history${sidebarOpen ? " sp-btn--history-open" : ""}`}
              onClick={() => setSidebarOpen((v) => !v)}
              title="Ver histórico de rascunhar
              s"
            >
              🗂 Rascunhar
              s
              {history.length > 0 && (
                <span className="sp-history-count">{history.length}</span>
              )}
            </button>

            <button className="sp-btn sp-btn--clear" onClick={clearCanvas} title="Limpar canvas">
              🗑
            </button>

            <button
              className="sp-btn sp-btn--close"
              onClick={() => dispatch({ type: "TOGGLE_SCRATCHPAD" })}
              title="Fechar rascunhar
              "
            >
              ✕
            </button>
          </div>
        </div>

        {}
        <div className="sp-body">

          {}
          <div className="sp-canvas-wrapper">
            <canvas
              ref={canvasRef}
              width={560}
              height={280}
              className={`sp-canvas${tool === "eraser" ? " sp-canvas--eraser" : ""}`}
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={endDraw}
              onMouseLeave={endDraw}
              onTouchStart={startDraw}
              onTouchMove={draw}
              onTouchEnd={endDraw}
            />
            <p className="sp-hint">
              {tool === "eraser"
                ? "🧹 Modo borracha — clique e arraste para apagar"
                : "Clique e arraste para desenhar · Salva automaticamente ao avançar"}
            </p>
          </div>

          {}
          {sidebarOpen && (
            <aside className="sp-sidebar">
              <div className="sp-sidebar-header">
                <span className="sp-sidebar-title">🗂 Histórico</span>
                <button
                  className="sp-sidebar-close"
                  onClick={() => setSidebarOpen(false)}
                  aria-label="Fechar histórico"
                >✕</button>
              </div>

              {history.length === 0 ? (
                <div className="sp-sidebar-empty">
                  <span className="sp-sidebar-empty-icon">💾</span>
                  <p>Nenhum rascunhar
                     salvo ainda.</p>
                  <p>Clique em <strong>"Salvar Rascunhar
                    "</strong> para guardar uma cópia do desenho atual.</p>
                </div>
              ) : (
                <ul className="sp-thumbnails" role="list">
                  {history.map((item, i) => (
                    <li
                      key={item.id}
                      className="sp-thumb-item"
                      onClick={() => restoreFromHistory(item.dataUrl)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === "Enter" && restoreFromHistory(item.dataUrl)}
                      title={`Carregar ${item.label}`}
                    >
                      <img
                        src={item.dataUrl}
                        alt={item.label}
                        className="sp-thumb-img"
                      />
                      <div className="sp-thumb-footer">
                        <span className="sp-thumb-label">#{i + 1}</span>
                        <button
                          className="sp-thumb-delete"
                          onClick={(e) => removeFromHistory(item.id, e)}
                          title="Remover"
                          aria-label={`Remover ${item.label}`}
                        >✕</button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </aside>
          )}
        </div>

      </div>
    </div>
  );
});

export default Scratchpad;
