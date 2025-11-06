-- Assignment Tracking Schema for CourseConnect
-- Run this in your Supabase SQL editor

-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(20) NOT NULL, -- "MATH101", "CS201"
  name VARCHAR(200) NOT NULL, -- "Calculus I", "Data Structures"
  semester VARCHAR(50) NOT NULL, -- "Fall 2024", "Spring 2025"
  professor VARCHAR(100),
  chat_id VARCHAR(100) UNIQUE, -- Links to chat room
  user_id VARCHAR(100) NOT NULL, -- Owner of the course
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create assignments table
CREATE TABLE IF NOT EXISTS assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'overdue')),
  priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  estimated_time INTEGER DEFAULT 0, -- in hours
  actual_time INTEGER, -- in hours
  grade DECIMAL(5,2), -- grade received
  chat_id VARCHAR(100), -- Link to course chat
  user_id VARCHAR(100) NOT NULL, -- Owner of the assignment
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_courses_user_id ON courses(user_id);
CREATE INDEX IF NOT EXISTS idx_courses_chat_id ON courses(chat_id);
CREATE INDEX IF NOT EXISTS idx_assignments_course_id ON assignments(course_id);
CREATE INDEX IF NOT EXISTS idx_assignments_user_id ON assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_assignments_due_date ON assignments(due_date);
CREATE INDEX IF NOT EXISTS idx_assignments_status ON assignments(status);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assignments_updated_at BEFORE UPDATE ON assignments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically set status to 'overdue' when due date passes
CREATE OR REPLACE FUNCTION check_overdue_assignments()
RETURNS void AS $$
BEGIN
    UPDATE assignments 
    SET status = 'overdue' 
    WHERE due_date < NOW() 
    AND status IN ('pending', 'in_progress');
END;
$$ language 'plpgsql';

-- Enable Row Level Security (RLS)
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own courses" ON courses
    FOR SELECT USING (user_id = auth.uid()::text OR user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can insert their own courses" ON courses
    FOR INSERT WITH CHECK (user_id = auth.uid()::text OR user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can update their own courses" ON courses
    FOR UPDATE USING (user_id = auth.uid()::text OR user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can delete their own courses" ON courses
    FOR DELETE USING (user_id = auth.uid()::text OR user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can view their own assignments" ON assignments
    FOR SELECT USING (user_id = auth.uid()::text OR user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can insert their own assignments" ON assignments
    FOR INSERT WITH CHECK (user_id = auth.uid()::text OR user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can update their own assignments" ON assignments
    FOR UPDATE USING (user_id = auth.uid()::text OR user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can delete their own assignments" ON assignments
    FOR DELETE USING (user_id = auth.uid()::text OR user_id = current_setting('app.current_user_id', true));

-- Insert some sample data for testing
INSERT INTO courses (code, name, semester, professor, chat_id, user_id) VALUES
('MATH101', 'Calculus I', 'Fall 2024', 'Dr. Smith', 'math101-fall2024', 'test-user'),
('CS201', 'Data Structures', 'Fall 2024', 'Prof. Johnson', 'cs201-fall2024', 'test-user'),
('PHYS101', 'Physics I', 'Fall 2024', 'Dr. Brown', 'phys101-fall2024', 'test-user')
ON CONFLICT (chat_id) DO NOTHING;

INSERT INTO assignments (course_id, title, description, due_date, status, priority, estimated_time, chat_id, user_id) VALUES
((SELECT id FROM courses WHERE code = 'MATH101' LIMIT 1), 'Calculus Problem Set 1', 'Solve problems 1-20 from chapter 2', NOW() + INTERVAL '3 days', 'pending', 'high', 4, 'math101-fall2024', 'test-user'),
((SELECT id FROM courses WHERE code = 'MATH101' LIMIT 1), 'Midterm Exam', 'Chapters 1-5 comprehensive exam', NOW() + INTERVAL '1 week', 'pending', 'high', 2, 'math101-fall2024', 'test-user'),
((SELECT id FROM courses WHERE code = 'CS201' LIMIT 1), 'Binary Tree Implementation', 'Implement binary tree with insert, delete, search', NOW() + INTERVAL '5 days', 'in_progress', 'medium', 6, 'cs201-fall2024', 'test-user'),
((SELECT id FROM courses WHERE code = 'CS201' LIMIT 1), 'Algorithm Analysis Report', 'Analyze time complexity of sorting algorithms', NOW() + INTERVAL '2 weeks', 'pending', 'medium', 3, 'cs201-fall2024', 'test-user'),
((SELECT id FROM courses WHERE code = 'PHYS101' LIMIT 1), 'Lab Report 3', 'Kinematics experiment analysis', NOW() + INTERVAL '4 days', 'pending', 'low', 2, 'phys101-fall2024', 'test-user')
ON CONFLICT DO NOTHING;
