-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PROFILES
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- QUESTIONS
CREATE TABLE questions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ANSWERS
CREATE TABLE answers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  is_accepted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- VOTES
CREATE TABLE votes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  answer_id UUID REFERENCES answers(id) ON DELETE CASCADE NOT NULL,
  vote_type SMALLINT CHECK (vote_type IN (1, -1)),
  UNIQUE(user_id, answer_id)
);

-- TAGS
CREATE TABLE tags (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);

-- QUESTION_TAGS
CREATE TABLE question_tags (
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE NOT NULL,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE NOT NULL,
  PRIMARY KEY (question_id, tag_id)
);

-- NOTIFICATIONS
CREATE TABLE notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT CHECK (type IN ('answer', 'mention')),
  reference_id UUID NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- POLICIES

-- Profiles: Anyone can read, users can update their own
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

-- Questions: Anyone can read, auth users can insert, owner can update/delete
CREATE POLICY "Questions are viewable by everyone." ON questions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert questions." ON questions FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update their own questions." ON questions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own questions." ON questions FOR DELETE USING (auth.uid() = user_id);

-- Answers: Anyone can read, auth users can insert, owner can update
CREATE POLICY "Answers are viewable by everyone." ON answers FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert answers." ON answers FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update their own answers." ON answers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Question owners can accept answers." ON answers FOR UPDATE USING (
  auth.uid() IN (SELECT user_id FROM questions WHERE id = answers.question_id)
);
CREATE POLICY "Users can delete their own answers." ON answers FOR DELETE USING (auth.uid() = user_id);

-- Votes: Anyone can read, auth users can insert/update/delete their own
CREATE POLICY "Votes are viewable by everyone." ON votes FOR SELECT USING (true);
CREATE POLICY "Users can insert their own votes." ON votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own votes." ON votes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own votes." ON votes FOR DELETE USING (auth.uid() = user_id);

-- Tags: Anyone can read, auth users can insert
CREATE POLICY "Tags are viewable by everyone." ON tags FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create tags." ON tags FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Question Tags: Anyone can read, auth users can insert for their questions
CREATE POLICY "Question tags are viewable by everyone." ON question_tags FOR SELECT USING (true);
CREATE POLICY "Users can insert tags for their questions." ON question_tags FOR INSERT WITH CHECK (
  auth.uid() IN (SELECT user_id FROM questions WHERE id = question_tags.question_id)
);
CREATE POLICY "Users can delete tags for their questions." ON question_tags FOR DELETE USING (
  auth.uid() IN (SELECT user_id FROM questions WHERE id = question_tags.question_id)
);

-- Notifications: Users can only read/update their own notifications
CREATE POLICY "Users can view their own notifications." ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert notifications." ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own notifications." ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own notifications." ON notifications FOR DELETE USING (auth.uid() = user_id);
