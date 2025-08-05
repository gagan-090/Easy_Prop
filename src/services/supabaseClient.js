import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://xjpjjxlnnxerxmvzvgka.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqcGpqeGxubnhlcnhtdnp2Z2thIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMTA4MzcsImV4cCI6MjA2OTY4NjgzN30.WHskY1Pbli6c6K2WhJ5mfoqb0axq0FF2QAl0v5tLlvk';

// Create a single Supabase client instance
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase; 