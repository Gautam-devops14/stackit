const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function main() {
  const { data, error } = await supabase
    .from('questions')
    .select(`
      id,
      title,
      created_at,
      profiles (
        username,
        avatar_url
      ),
      question_tags (
        tags (
          name
        )
      ),
      answers:answers(count)
    `);
  console.log("Error:", error);
  console.log("Data count:", data ? data.length : 0);
}
main();
