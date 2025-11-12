import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ksrrswcnkzjmblfgdsve.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzcnJzd2Nua3pqbWJsZmdkc3ZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5NTIwMzAsImV4cCI6MjA3ODUyODAzMH0.gIlRCkAGY0Vhu3kq5gy9aiKCxp2glHR-OoxsvWmWa4Q';

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase URL and Key must be provided.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
