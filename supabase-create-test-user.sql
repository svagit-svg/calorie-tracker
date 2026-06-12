-- ============================================================
-- Создание тестового пользователя для FitDiary
-- Запустить в: Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Создать пользователя в auth.users (через встроенную функцию Supabase)
SELECT auth.sign_up(
  'test@fitdiary.ru',   -- email
  'FitDiary2024!'       -- пароль
);

-- 2. Если sign_up недоступен — создать вручную через admin API (см. ниже)
-- Либо просто зарегистрируйся в приложении с email: test@fitdiary.ru / пароль: FitDiary2024!

-- 3. После регистрации — сделать пользователя PRO:
UPDATE public.profiles
SET
  is_pro       = true,
  total_photos = 0,
  name         = 'Test User',
  gender       = 'male',
  age          = 30,
  weight       = 75,
  height       = 180,
  goal         = 'maintain',
  activity     = 'moderate',
  daily_goal   = 2500
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'test@fitdiary.ru'
);

-- Проверка:
SELECT
  u.email,
  p.name,
  p.is_pro,
  p.total_photos,
  p.daily_goal
FROM auth.users u
JOIN public.profiles p ON p.id = u.id
WHERE u.email = 'test@fitdiary.ru';
