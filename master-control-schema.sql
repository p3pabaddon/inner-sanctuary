-- MASTER CONTROL DASHBOARD v1.2 - SQL SCHEMA
-- Bu kodu Supabase SQL Editor'a yapıştırıp çalıştırın.

-- 1. Blog Yazıları Tablosu
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    category TEXT,
    image_url TEXT,
    excerpt TEXT,
    content TEXT,
    author TEXT DEFAULT 'Admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Hizmetler ve Fiyatlandırma Tablosu
CREATE TABLE IF NOT EXISTS public.services (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    duration TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Genel Site Konfigürasyonu Tablosu
CREATE TABLE IF NOT EXISTS public.site_config (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    site_title TEXT DEFAULT 'İçsel Sığınak Psikoloji',
    phone TEXT DEFAULT '05XX XXX XX XX',
    whatsapp TEXT DEFAULT '905XX XXX XX XX',
    email TEXT DEFAULT 'iletisim@icselsiginak.com',
    instagram TEXT DEFAULT '@icselsiginak',
    primary_color TEXT DEFAULT '#F97B22',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Örnek Veri Ekleme (Başlangıç Ayarları için)
-- Eğer tablo boşsa bir satır ayarlar ekler
INSERT INTO public.site_config (site_title)
SELECT 'İçsel Sığınak Psikoloji'
WHERE NOT EXISTS (SELECT 1 FROM public.site_config);

-- 5. Row Level Security (Güvenlik Ayarları)
-- Sadece okuma yetkisi herkes için, yazma yetkisi sadece admin için (veya anonim testi için şimdilik açık)
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Herkes okuyabilir" ON public.blog_posts FOR SELECT USING (true);
CREATE POLICY "Admin her şeyi yapabilir" ON public.blog_posts FOR ALL USING (true);

CREATE POLICY "Herkes hizmetleri görebilir" ON public.services FOR SELECT USING (true);
CREATE POLICY "Admin hizmetleri yönetebilir" ON public.services FOR ALL USING (true);

CREATE POLICY "Herkes ayarları görebilir" ON public.site_config FOR SELECT USING (true);
CREATE POLICY "Admin ayarları yönetebilir" ON public.site_config FOR ALL USING (true);
