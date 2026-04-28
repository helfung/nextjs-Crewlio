import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://gfyfznhuctvsymecxe.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmeWZ6bmh1Y3R2c3ltZWN4ZXJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczMTM5MjIsImV4cCI6MjA5Mjg4OTkyMn0.p_VrrYRF8GOZ9SrpIo9ujzprhG9AlG1GO8-iLDwQrG8";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);