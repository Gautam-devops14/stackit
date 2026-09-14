const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function main() {
  const { data: { user }, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'gmediting555@gmail.com',
    password: 'password123'
  });
  if (authErr) {
    console.log("Auth error:", authErr.message);
  }
  
  const { error } = await supabase.from('profiles').update({ is_banned: true }).eq('username', 'aenipatel');
  console.log("Ban update error:", error);
}
main();
