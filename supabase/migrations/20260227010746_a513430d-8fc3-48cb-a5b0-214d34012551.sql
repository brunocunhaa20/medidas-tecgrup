
-- Create measurements table
CREATE TABLE public.measurements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create measurement items table
CREATE TABLE public.measurement_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  measurement_id UUID NOT NULL REFERENCES public.measurements(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  value NUMERIC,
  unit TEXT DEFAULT 'cm',
  notes TEXT,
  image_url TEXT,
  annotations JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.measurement_items ENABLE ROW LEVEL SECURITY;

-- Measurements policies
CREATE POLICY "Users can view own measurements" ON public.measurements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own measurements" ON public.measurements FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own measurements" ON public.measurements FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own measurements" ON public.measurements FOR DELETE USING (auth.uid() = user_id);

-- Measurement items policies
CREATE POLICY "Users can view own items" ON public.measurement_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own items" ON public.measurement_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own items" ON public.measurement_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own items" ON public.measurement_items FOR DELETE USING (auth.uid() = user_id);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_measurements_updated_at BEFORE UPDATE ON public.measurements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_measurement_items_updated_at BEFORE UPDATE ON public.measurement_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for measurement images
INSERT INTO storage.buckets (id, name, public) VALUES ('measurement-images', 'measurement-images', true);

CREATE POLICY "Users can upload measurement images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'measurement-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can view measurement images" ON storage.objects FOR SELECT USING (bucket_id = 'measurement-images');
CREATE POLICY "Users can update measurement images" ON storage.objects FOR UPDATE USING (bucket_id = 'measurement-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete measurement images" ON storage.objects FOR DELETE USING (bucket_id = 'measurement-images' AND auth.uid()::text = (storage.foldername(name))[1]);
