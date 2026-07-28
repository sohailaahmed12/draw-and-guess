import { useRef, useEffect, useState } from 'react';
import { socket } from './socket';

const COLORS = ['#2E2A45', '#FF6F91', '#5FC9D8', '#FFC857', '#8FD6A6'];

function DrawingCanvas({ roomCode, isDrawer }) {
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);
  const lastPointRef = useRef(null);
  const [color, setColor] = useState(COLORS[0]);

  function getCtx() {
    return canvasRef.current.getContext('2d');
  }

  function drawLine(x0, y0, x1, y1, strokeColor) {
    const ctx = getCtx();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
  }

 function getScaledPoint(e) {
  const canvas = canvasRef.current;
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top) * scaleY,
  };
}

function handleMouseDown(e) {
  if (!isDrawer) return;
  drawingRef.current = true;
  lastPointRef.current = getScaledPoint(e);
}

function handleMouseMove(e) {
  if (!isDrawer || !drawingRef.current) return;
  const point = getScaledPoint(e);
  const last = lastPointRef.current;

  drawLine(last.x, last.y, point.x, point.y, color);

  socket.emit('draw-stroke', {
    roomCode,
    stroke: { x0: last.x, y0: last.y, x1: point.x, y1: point.y, color },
  });

  lastPointRef.current = point;
}

  function handleMouseUp() {
    drawingRef.current = false;
  }

  function handleClear() {
    getCtx().clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    socket.emit('clear-canvas', { roomCode });
  }

  useEffect(() => {
    socket.on('draw-stroke', (stroke) => {
      drawLine(stroke.x0, stroke.y0, stroke.x1, stroke.y1, stroke.color);
    });
    socket.on('clear-canvas', () => {
      getCtx().clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    });
    return () => {
      socket.off('draw-stroke');
      socket.off('clear-canvas');
    };
  }, []);

  return (
    <div className="paper-card canvas-card">
      <canvas
        ref={canvasRef}
        width={600}
        height={400}
        className="doodle-canvas"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
      {isDrawer && (
        <div className="canvas-tools">
          {COLORS.map((c) => (
            <button
              key={c}
              className={`color-dot ${c === color ? 'selected' : ''}`}
              style={{ background: c }}
              onClick={() => setColor(c)}
            />
          ))}
          <button className="crayon-btn sunshine small" onClick={handleClear}>Clear</button>
        </div>
      )}
    </div>
  );
}

export default DrawingCanvas;