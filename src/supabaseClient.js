import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://zpprkjtbhwdaihvkjzry.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwcHJranRiaHdkYWlodmtqenJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzMDM3ODAsImV4cCI6MjA5Mzg3OTc4MH0.g6AhGaYLBh9vcjTLMt49-mN05nwCc0wcqHmRLUyNRGY'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
