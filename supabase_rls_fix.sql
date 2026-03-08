-- 1. Hizmetler (Services) Tablosu için RLS Ayarları
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Herkesin hizmetleri görebilmesine izin ver (Select)
DROP POLICY IF EXISTS "Allow public select on services" ON public.services;
CREATE POLICY "Allow public select on services" ON public.services FOR SELECT USING (true);

-- Adminlerin hizmetleri tam yetkiyle yönetebilmesine izin ver (Insert, Update, Delete, Select)
DROP POLICY IF EXISTS "Allow admin all on services" ON public.services;
CREATE POLICY "Allow admin all on services" ON public.services 
FOR ALL 
TO authenticated, anon
USING (true)
WITH CHECK (true);

-- 2. Blog Yazıları için RLS Ayarları
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public select on blog_posts" ON public.blog_posts;
CREATE POLICY "Allow public select on blog_posts" ON public.blog_posts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow admin all on blog_posts" ON public.blog_posts;
CREATE POLICY "Allow admin all on blog_posts" ON public.blog_posts 
FOR ALL 
TO authenticated, anon
USING (true)
WITH CHECK (true);

-- NOT: Bu ayarlar geliştirme aşaması için tam yetki (authenticated ve anon) sağlar. 
-- Canlıya geçerken 'anon' yetkilerini sadece SELECT ile sınırlamanız güvenliğiniz için önemlidir.
