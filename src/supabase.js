import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://vrovpxlhtjomrwsvqgnh.supabase.co";

const supabaseAnonKey =
  "sb_publishable_vDWBROxl5SssBMYDsVrpXg_vt7sX0T_";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);