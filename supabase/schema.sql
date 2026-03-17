-- 创建品牌表
CREATE TABLE IF NOT EXISTS brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建动效表
CREATE TABLE IF NOT EXISTS motions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_path TEXT NOT NULL,
  title TEXT,
  brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
  app_name TEXT,
  motion_type TEXT[],
  style_tags TEXT[],
  duration NUMERIC,
  resolution TEXT,
  file_type TEXT NOT NULL CHECK (file_type IN ('mp4', 'webp', 'gif', 'lottie')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以提升查询性能
CREATE INDEX IF NOT EXISTS idx_motions_brand_id ON motions(brand_id);
CREATE INDEX IF NOT EXISTS idx_motions_created_at ON motions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_motions_motion_type ON motions USING GIN(motion_type);
CREATE INDEX IF NOT EXISTS idx_motions_style_tags ON motions USING GIN(style_tags);
CREATE INDEX IF NOT EXISTS idx_brands_slug ON brands(slug);

-- 创建全文搜索索引
CREATE INDEX IF NOT EXISTS idx_motions_title_search ON motions USING GIN(to_tsvector('simple', COALESCE(title, '')));
CREATE INDEX IF NOT EXISTS idx_motions_app_name_search ON motions USING GIN(to_tsvector('simple', COALESCE(app_name, '')));

-- 插入示例品牌数据
INSERT INTO brands (name, slug, description) VALUES
  ('Duolingo', 'duolingo', '多邻国 - 语言学习应用'),
  ('Airbnb', 'airbnb', '爱彼迎 - 民宿预订平台'),
  ('Apple', 'apple', '苹果公司'),
  ('Spotify', 'spotify', '音乐流媒体平台'),
  ('Instagram', 'instagram', '图片社交平台'),
  ('TikTok', 'tiktok', '短视频平台')
ON CONFLICT (name) DO NOTHING;

-- 启用 Row Level Security (可选，用于私有库功能)
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE motions ENABLE ROW LEVEL SECURITY;

-- 创建公开访问策略（开发阶段）
CREATE POLICY "Enable read access for all users" ON brands FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON motions FOR SELECT USING (true);

-- 创建插入策略（需要认证，后续可根据需求调整）
CREATE POLICY "Enable insert for authenticated users only" ON brands FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert for authenticated users only" ON motions FOR INSERT WITH CHECK (true);

-- 创建更新策略
CREATE POLICY "Enable update for authenticated users only" ON brands FOR UPDATE USING (true);
CREATE POLICY "Enable update for authenticated users only" ON motions FOR UPDATE USING (true);

-- 创建删除策略
CREATE POLICY "Enable delete for authenticated users only" ON brands FOR DELETE USING (true);
CREATE POLICY "Enable delete for authenticated users only" ON motions FOR DELETE USING (true);
