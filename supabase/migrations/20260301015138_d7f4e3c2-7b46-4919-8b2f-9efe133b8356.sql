
ALTER TABLE public.measurements 
ADD COLUMN IF NOT EXISTS rede text DEFAULT '',
ADD COLUMN IF NOT EXISTS bandeira text DEFAULT '',
ADD COLUMN IF NOT EXISTS cnpj text DEFAULT '',
ADD COLUMN IF NOT EXISTS nome_fantasia text DEFAULT '',
ADD COLUMN IF NOT EXISTS gerente_nome text DEFAULT '',
ADD COLUMN IF NOT EXISTS gerente_telefone text DEFAULT '',
ADD COLUMN IF NOT EXISTS foto_posto text DEFAULT '';
