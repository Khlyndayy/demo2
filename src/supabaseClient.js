import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://crcfppzljkbbsvdxrjjy.supabase.co";
const SUPABASE_API_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyY2ZwcHpsamtiYnN2ZHhyamp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2ODg5MjcsImV4cCI6MjA3OTI2NDkyN30.A4V5ivSLsMh4FDialFQ1Sj2A6iW7ZpjNZriQ0KLbZvM";
export const supabase = createClient(SUPABASE_URL, SUPABASE_API_KEY);
