const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
async function test() {
  let { data: v } = await supabase.from('votes').select('*').limit(1);
  console.log("Votes:", v ? Object.keys(v[0] || {}) : "error");
  let { data: n } = await supabase.from('notifications').select('*').limit(1);
  console.log("Notifications:", n ? Object.keys(n[0] || {}) : "error");
}
test();
