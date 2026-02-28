import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Pencil, Trash2, Image as ImageIcon } from "lucide-react";
import ImageAnnotator, { Annotation } from "@/components/ImageAnnotator";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { FotoAnotada } from "./types";

interface ImageUploadListProps {
    label: string;
    images: FotoAnotada[];
    onChange: (images: FotoAnotada[]) => void;
    maxImages?: number;
}

export const ImageUploadList = ({ label, images, onChange, maxImages = 10 }: ImageUploadListProps) => {
    const [uploading, setUploading] = useState(false);
    const [annotatingIndex, setAnnotatingIndex] = useState<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { user } = useAuth();
    const { toast } = useToast();

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        if (images.length >= maxImages) {
            toast({ title: "Limite de imagens atingido", variant: "destructive" });
            return;
        }

        setUploading(true);
        try {
            const ext = file.name.split(".").pop();
            const path = `${user.id}/${crypto.randomUUID()}.${ext}`;

            const { error: uploadError } = await supabase.storage
                .from("measurement-images")
                .upload(path, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from("measurement-images")
                .getPublicUrl(path);

            onChange([...images, { id: crypto.randomUUID(), url: publicUrl, annotations: [] }]);
        } catch (err: any) {
            toast({ title: "Erro no upload", description: err.message, variant: "destructive" });
        } finally {
            setUploading(false);
        }
    };

    const removeImage = (index: number) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        onChange(newImages);
    };

    const updateAnnotations = (index: number, annotations: Annotation[]) => {
        const newImages = [...images];
        newImages[index].annotations = annotations;
        onChange(newImages);
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{label}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {images.map((img, idx) => (
                    <div key={img.id} className="relative group rounded-lg overflow-hidden border bg-muted/30 aspect-square">
                        <img src={img.url} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/40 transition-colors flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                            <Button size="sm" onClick={() => setAnnotatingIndex(idx)}>
                                <Pencil className="h-4 w-4 mr-1" /> Anotar
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => removeImage(idx)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                        {img.annotations.length > 0 && (
                            <div className="absolute top-1 right-1 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded-full font-mono">
                                {img.annotations.length}
                            </div>
                        )}
                    </div>
                ))}

                {images.length < maxImages && (
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="w-full aspect-square border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
                    >
                        {uploading ? (
                            <span className="text-xs">Enviando...</span>
                        ) : (
                            <>
                                <ImageIcon className="h-6 w-6" />
                                <span className="text-xs text-center px-1">Adicionar</span>
                            </>
                        )}
                    </button>
                )}
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageUpload}
                className="hidden"
            />

            {annotatingIndex !== null && images[annotatingIndex] && (
                <ImageAnnotator
                    imageUrl={images[annotatingIndex].url}
                    annotations={images[annotatingIndex].annotations}
                    onAnnotationsChange={(anns) => updateAnnotations(annotatingIndex, anns)}
                    onClose={() => setAnnotatingIndex(null)}
                />
            )}
        </div>
    );
};
