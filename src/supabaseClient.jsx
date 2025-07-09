import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://znyzyswzocugaxnuvupe.supabase.co'; 
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpueXp5c3d6b2N1Z2F4bnV2dXBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwMzk5NjgsImV4cCI6MjA2NzYxNTk2OH0.tjXam4d1oOG8fhaGy-tO89PHKx-TPC-L3vxt9UKrgRc'; 

export const supabase = createClient(supabaseUrl, supabaseAnonKey);