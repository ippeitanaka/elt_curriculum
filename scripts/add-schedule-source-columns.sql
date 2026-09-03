-- 元データCSVを加工せずアップロードできるようにするための受け皿列。
-- アプリのカリキュラム表示では使用しない。

alter table public.curriculum
  add column if not exists "全体行事" text,
  add column if not exists "広報" text,
  add column if not exists "学科予定" text,
  add column if not exists "試験" text;

-- Supabase / PostgREST のスキーマキャッシュを更新
notify pgrst, 'reload schema';
