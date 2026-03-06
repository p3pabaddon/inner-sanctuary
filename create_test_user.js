import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://atyhzggjifkryeibqkyl.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0eWh6Z2dqaWZrcnllaWJxa3lsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjE4NjQyMywiZXhwIjoyMDg3NzYyNDIzfQ.RCCqWnj6K-mZb32u3RzrjgSSLx0aY9CkQwqiOJabDQk';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function createUser() {
    console.log('Creating test user...');
    const { data, error } = await supabase.auth.admin.createUser({
        email: 'test@mindcare.com',
        password: 'Password123!',
        user_metadata: { full_name: 'Test Kullanıcısı' },
        email_confirm: true
    });

    if (error) {
        if (error.message.includes('already registered')) {
            console.log('User already exists, proceeding...');
        } else {
            console.error('Error creating user:', error.message);
        }
    } else {
        console.log('User created successfully:', data.user.id);
    }
}

createUser();
