import { useRef, useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Ruler, Type, Undo2, Trash2, Check } from "lucide-react";

export interface Annotation {
  id: string;
  type: "line" | "text";
  startX: number;
  startY: number;
  endX?: number;
  endY?: number;
  text?: string;
  color: string;
}

interface ImageAnnotatorProps {
  imageUrl: string;
  annotations: Annotation[];
  onAnnotationsChange: (annotations: Annotation[]) => void;
  onClose: () => void;
}

const COLORS = [
  "hsl(25, 95%, 53%)",
  "hsl(0, 84%, 60%)",
  "hsl(142, 76%, 36%)",
  "hsl(210, 80%, 55%)",
  "hsl(280, 70%, 55%)",
];

const ImageAnnotator = ({ imageUrl, annotations, onAnnotationsChange, onClose }: ImageAnnotatorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [tool, setTool] = useState<"line" | "text">("line");
  const [color, setColor] = useState(COLORS[0]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [currentAnnotations, setCurrentAnnotations] = useState<Annotation[]>(annotations);
  const [textInput, setTextInput] = useState("");
  const [textPosition, setTextPosition] = useState<{ x: number; y: number } | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });

  const drawAll = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const img = imageRef.current;
    if (!canvas || !ctx || !img) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    currentAnnotations.forEach((ann) => {
      ctx.strokeStyle = ann.color;
      ctx.fillStyle = ann.color;
      ctx.lineWidth = 2.5;
      ctx.font = "bold 16px 'Space Grotesk', sans-serif";

      if (ann.type === "line" && ann.endX !== undefined && ann.endY !== undefined) {
        ctx.beginPath();
        ctx.moveTo(ann.startX, ann.startY);
        ctx.lineTo(ann.endX, ann.endY);
        ctx.stroke();

        // Draw endpoints
        [{ x: ann.startX, y: ann.startY }, { x: ann.endX, y: ann.endY }].forEach((p) => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
          ctx.fill();
        });

        // Draw measurement label
        const dx = ann.endX - ann.startX;
        const dy = ann.endY - ann.startY;
        const length = Math.sqrt(dx * dx + dy * dy).toFixed(0);
        const midX = (ann.startX + ann.endX) / 2;
        const midY = (ann.startY + ann.endY) / 2;
        
        ctx.fillStyle = "hsl(220, 25%, 10%)";
        const textW = ctx.measureText(`${length}px`).width + 12;
        ctx.fillRect(midX - textW / 2, midY - 12, textW, 24);
        ctx.fillStyle = ann.color;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`${length}px`, midX, midY);
      }

      if (ann.type === "text" && ann.text) {
        ctx.fillStyle = "hsl(220, 25%, 10%)";
        const textW = ctx.measureText(ann.text).width + 12;
        ctx.fillRect(ann.startX - 2, ann.startY - 14, textW, 24);
        ctx.fillStyle = ann.color;
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText(ann.text, ann.startX + 4, ann.startY);
      }
    });
  }, [currentAnnotations]);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imageRef.current = img;
      const container = containerRef.current;
      if (!container) return;
      
      const maxW = container.clientWidth - 32;
      const maxH = window.innerHeight * 0.6;
      const ratio = Math.min(maxW / img.width, maxH / img.height, 1);
      
      setCanvasSize({
        width: Math.round(img.width * ratio),
        height: Math.round(img.height * ratio),
      });
    };
    img.src = imageUrl;
  }, [imageUrl]);

  useEffect(() => {
    drawAll();
  }, [drawAll, canvasSize]);

  const getPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getPos(e);
    if (tool === "text") {
      setTextPosition(pos);
      return;
    }
    setIsDrawing(true);
    setStartPoint(pos);
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPoint) return;
    const pos = getPos(e);
    const ann: Annotation = {
      id: crypto.randomUUID(),
      type: "line",
      startX: startPoint.x,
      startY: startPoint.y,
      endX: pos.x,
      endY: pos.y,
      color,
    };
    setCurrentAnnotations((prev) => [...prev, ann]);
    setIsDrawing(false);
    setStartPoint(null);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPoint) return;
    drawAll();
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const pos = getPos(e);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(startPoint.x, startPoint.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    ctx.setLineDash([]);
  };

  const addTextAnnotation = () => {
    if (!textPosition || !textInput.trim()) return;
    const ann: Annotation = {
      id: crypto.randomUUID(),
      type: "text",
      startX: textPosition.x,
      startY: textPosition.y,
      text: textInput,
      color,
    };
    setCurrentAnnotations((prev) => [...prev, ann]);
    setTextInput("");
    setTextPosition(null);
  };

  const undo = () => setCurrentAnnotations((prev) => prev.slice(0, -1));
  const clearAll = () => setCurrentAnnotations([]);

  const save = () => {
    onAnnotationsChange(currentAnnotations);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 backdrop-blur-sm p-4">
      <div ref={containerRef} className="w-full max-w-4xl rounded-xl bg-card shadow-2xl overflow-hidden animate-fade-in">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2 border-b p-3">
          <Button
            size="sm"
            variant={tool === "line" ? "default" : "outline"}
            onClick={() => setTool("line")}
          >
            <Ruler className="h-4 w-4 mr-1" /> Linha
          </Button>
          <Button
            size="sm"
            variant={tool === "text" ? "default" : "outline"}
            onClick={() => setTool("text")}
          >
            <Type className="h-4 w-4 mr-1" /> Texto
          </Button>

          <div className="h-6 w-px bg-border mx-1" />

          {COLORS.map((c) => (
            <button
              key={c}
              className={`h-6 w-6 rounded-full border-2 transition-transform ${color === c ? "scale-125 border-foreground" : "border-transparent"}`}
              style={{ backgroundColor: c }}
              onClick={() => setColor(c)}
            />
          ))}

          <div className="h-6 w-px bg-border mx-1" />

          <Button size="sm" variant="ghost" onClick={undo}>
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={clearAll}>
            <Trash2 className="h-4 w-4" />
          </Button>

          <div className="ml-auto flex gap-2">
            <Button size="sm" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button size="sm" onClick={save}>
              <Check className="h-4 w-4 mr-1" /> Salvar
            </Button>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex justify-center p-4 bg-muted/50 overflow-auto">
          <canvas
            ref={canvasRef}
            width={canvasSize.width}
            height={canvasSize.height}
            className="cursor-crosshair rounded-lg shadow-md"
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
          />
        </div>

        {/* Text input popup */}
        {textPosition && (
          <div className="flex items-center gap-2 p-3 border-t">
            <Input
              placeholder="Digite a medida..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTextAnnotation()}
              autoFocus
              className="max-w-xs"
            />
            <Button size="sm" onClick={addTextAnnotation}>Adicionar</Button>
            <Button size="sm" variant="ghost" onClick={() => setTextPosition(null)}>Cancelar</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageAnnotator;
