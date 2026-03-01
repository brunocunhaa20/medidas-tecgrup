import { useRef, useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Ruler, Type, Undo2, Trash2, Check, X } from "lucide-react";

export interface Annotation {
  id: string;
  type: "line" | "text";
  startX: number;
  startY: number;
  endX?: number;
  endY?: number;
  label?: string;
  value?: string;
  unit?: string;
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
  "hsl(0, 72%, 51%)",
  "hsl(218, 43%, 18%)",
  "hsl(142, 76%, 36%)",
  "hsl(45, 93%, 47%)",
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
  
  // Line labeling state
  const [pendingLine, setPendingLine] = useState<Omit<Annotation, "label" | "value" | "unit"> | null>(null);
  const [lineLabel, setLineLabel] = useState("");
  const [lineValue, setLineValue] = useState("");
  const [lineUnit, setLineUnit] = useState("cm");

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
      ctx.font = "bold 14px 'Space Grotesk', sans-serif";

      if (ann.type === "line" && ann.endX !== undefined && ann.endY !== undefined) {
        ctx.beginPath();
        ctx.moveTo(ann.startX, ann.startY);
        ctx.lineTo(ann.endX, ann.endY);
        ctx.stroke();

        [{ x: ann.startX, y: ann.startY }, { x: ann.endX, y: ann.endY }].forEach((p) => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
          ctx.fill();
        });

        const midX = (ann.startX + ann.endX) / 2;
        const midY = (ann.startY + ann.endY) / 2;
        const displayText = ann.label 
          ? `${ann.label}: ${ann.value || "?"} ${ann.unit || "cm"}`
          : `${ann.value || "?"} ${ann.unit || "cm"}`;
        
        ctx.fillStyle = "rgba(0,0,0,0.75)";
        const textW = ctx.measureText(displayText).width + 16;
        ctx.fillRect(midX - textW / 2, midY - 12, textW, 24);
        ctx.fillStyle = "#fff";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(displayText, midX, midY);
      }

      if (ann.type === "text" && ann.text) {
        ctx.fillStyle = "rgba(0,0,0,0.75)";
        const textW = ctx.measureText(ann.text).width + 12;
        ctx.fillRect(ann.startX - 2, ann.startY - 14, textW, 24);
        ctx.fillStyle = "#fff";
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
      const maxH = window.innerHeight * 0.5;
      const ratio = Math.min(maxW / img.width, maxH / img.height, 1);
      setCanvasSize({ width: Math.round(img.width * ratio), height: Math.round(img.height * ratio) });
    };
    img.src = imageUrl;
  }, [imageUrl]);

  useEffect(() => { drawAll(); }, [drawAll, canvasSize]);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    if ("touches" in e) {
      const touch = e.touches[0];
      return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
    }
    return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top };
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (pendingLine) return;
    const pos = getPos(e);
    if (tool === "text") { setTextPosition(pos); return; }
    setIsDrawing(true);
    setStartPoint(pos);
  };

  const handleEnd = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !startPoint) return;
    const pos = getPos(e);
    // Show line labeling form
    setPendingLine({
      id: crypto.randomUUID(),
      type: "line",
      startX: startPoint.x,
      startY: startPoint.y,
      endX: pos.x,
      endY: pos.y,
      color,
    });
    setIsDrawing(false);
    setStartPoint(null);
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
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

  const confirmLine = () => {
    if (!pendingLine) return;
    const ann: Annotation = {
      ...pendingLine,
      label: lineLabel || undefined,
      value: lineValue || undefined,
      unit: lineUnit,
    };
    setCurrentAnnotations((prev) => [...prev, ann]);
    setPendingLine(null);
    setLineLabel("");
    setLineValue("");
    setLineUnit("cm");
  };

  const cancelPendingLine = () => {
    setPendingLine(null);
    setLineLabel("");
    setLineValue("");
    setLineUnit("cm");
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

  const updateAnnotationValue = (id: string, newValue: string) => {
    setCurrentAnnotations(prev => prev.map(a => a.id === id ? { ...a, value: newValue } : a));
  };

  const undo = () => setCurrentAnnotations((prev) => prev.slice(0, -1));
  const clearAll = () => setCurrentAnnotations([]);
  const save = () => { onAnnotationsChange(currentAnnotations); onClose(); };

  const lineAnnotations = currentAnnotations.filter(a => a.type === "line");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 backdrop-blur-sm p-2">
      <div ref={containerRef} className="w-full max-w-4xl rounded-xl bg-card shadow-2xl overflow-hidden animate-fade-in max-h-[95vh] flex flex-col">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2 border-b p-2 shrink-0">
          <Button size="sm" variant={tool === "line" ? "default" : "outline"} onClick={() => setTool("line")}>
            <Ruler className="h-4 w-4 mr-1" /> Linha
          </Button>
          <Button size="sm" variant={tool === "text" ? "default" : "outline"} onClick={() => setTool("text")}>
            <Type className="h-4 w-4 mr-1" /> Texto
          </Button>
          <div className="h-6 w-px bg-border mx-1" />
          {COLORS.map((c) => (
            <button key={c} className={`h-5 w-5 rounded-full border-2 transition-transform ${color === c ? "scale-125 border-foreground" : "border-transparent"}`} style={{ backgroundColor: c }} onClick={() => setColor(c)} />
          ))}
          <div className="h-6 w-px bg-border mx-1" />
          <Button size="sm" variant="ghost" onClick={undo}><Undo2 className="h-4 w-4" /></Button>
          <Button size="sm" variant="ghost" onClick={clearAll}><Trash2 className="h-4 w-4" /></Button>
          <div className="ml-auto flex gap-2">
            <Button size="sm" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button size="sm" onClick={save}><Check className="h-4 w-4 mr-1" /> Salvar</Button>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex justify-center p-2 bg-muted/50 overflow-auto flex-1 min-h-0">
          <canvas
            ref={canvasRef}
            width={canvasSize.width}
            height={canvasSize.height}
            className="cursor-crosshair rounded-lg shadow-md touch-none"
            onMouseDown={handleStart}
            onMouseUp={handleEnd}
            onMouseMove={handleMove}
            onTouchStart={handleStart}
            onTouchEnd={handleEnd}
            onTouchMove={handleMove}
          />
        </div>

        {/* Pending line label form */}
        {pendingLine && (
          <div className="p-3 border-t bg-accent/10 space-y-2 shrink-0">
            <p className="text-sm font-medium">Nomear e definir valor da medida:</p>
            <div className="flex flex-wrap gap-2 items-end">
              <div className="space-y-1 flex-1 min-w-[120px]">
                <Label className="text-xs">Nome (opcional)</Label>
                <Input placeholder="Ex: Altura" value={lineLabel} onChange={(e) => setLineLabel(e.target.value)} className="h-9" />
              </div>
              <div className="space-y-1 w-24">
                <Label className="text-xs">Valor</Label>
                <Input placeholder="0" value={lineValue} onChange={(e) => setLineValue(e.target.value)} className="h-9" type="number" step="0.01" />
              </div>
              <div className="space-y-1 w-20">
                <Label className="text-xs">Unidade</Label>
                <Select value={lineUnit} onValueChange={setLineUnit}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mm">mm</SelectItem>
                    <SelectItem value="cm">cm</SelectItem>
                    <SelectItem value="m">m</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button size="sm" onClick={confirmLine} className="h-9"><Check className="h-4 w-4 mr-1" /> OK</Button>
              <Button size="sm" variant="ghost" onClick={cancelPendingLine} className="h-9"><X className="h-4 w-4" /></Button>
            </div>
          </div>
        )}

        {/* Text input */}
        {textPosition && (
          <div className="flex items-center gap-2 p-3 border-t shrink-0">
            <Input placeholder="Digite a anotação..." value={textInput} onChange={(e) => setTextInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addTextAnnotation()} autoFocus className="max-w-xs" />
            <Button size="sm" onClick={addTextAnnotation}>Adicionar</Button>
            <Button size="sm" variant="ghost" onClick={() => setTextPosition(null)}>Cancelar</Button>
          </div>
        )}

        {/* Measurement list */}
        {lineAnnotations.length > 0 && (
          <div className="p-3 border-t bg-muted/30 max-h-32 overflow-y-auto shrink-0">
            <p className="text-xs font-semibold text-muted-foreground mb-1">Medidas registradas:</p>
            <div className="space-y-1">
              {lineAnnotations.map((a) => (
                <div key={a.id} className="flex items-center gap-2 text-sm bg-card rounded px-2 py-1 border">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: a.color }} />
                  <span className="font-medium">{a.label || "Sem nome"}</span>
                  <Input
                    value={a.value || ""}
                    onChange={(e) => updateAnnotationValue(a.id, e.target.value)}
                    className="h-7 w-20 text-sm"
                    type="number"
                    step="0.01"
                  />
                  <span className="text-xs text-muted-foreground">{a.unit || "cm"}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageAnnotator;
