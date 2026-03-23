
CREATE TABLE IF NOT EXISTS t_p81781078_menstrual_cycle_trac.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p81781078_menstrual_cycle_trac.cycle_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES t_p81781078_menstrual_cycle_trac.users(id),
  cycle_start DATE,
  cycle_end DATE,
  symptoms TEXT[],
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p81781078_menstrual_cycle_trac.pregnancy_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES t_p81781078_menstrual_cycle_trac.users(id),
  last_period DATE,
  due_date DATE,
  symptoms TEXT[],
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p81781078_menstrual_cycle_trac.calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES t_p81781078_menstrual_cycle_trac.users(id),
  event_date DATE NOT NULL,
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p81781078_menstrual_cycle_trac.partner_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invite_code TEXT UNIQUE NOT NULL,
  owner_user_id UUID REFERENCES t_p81781078_menstrual_cycle_trac.users(id),
  partner_user_id UUID REFERENCES t_p81781078_menstrual_cycle_trac.users(id),
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS t_p81781078_menstrual_cycle_trac.user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES t_p81781078_menstrual_cycle_trac.users(id) UNIQUE,
  theme_id TEXT DEFAULT 'rose',
  mode TEXT DEFAULT 'cycle',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
