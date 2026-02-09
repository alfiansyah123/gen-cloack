import { createSupabaseClient } from '../utils/supabase';

// Change admin password
export async function onRequestPost(context) {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    try {
        const supabase = createSupabaseClient(context.env);
        const { password } = await context.request.json();

        if (!password || password.length < 6) {
            return new Response(JSON.stringify({ error: 'Password must be at least 6 characters' }), { status: 400, headers });
        }

        // Upsert password to settings table
        const { error } = await supabase
            .from('settings')
            .upsert({ key: 'admin_password', value: password }, { onConflict: 'key' });

        if (error) throw error;

        return new Response(JSON.stringify({ success: true, message: 'Password updated successfully' }), { status: 200, headers });

    } catch (error) {
        console.error('Error updating password:', error);
        return new Response(JSON.stringify({ error: 'Failed to update password: ' + error.message }), { status: 500, headers });
    }
}

export async function onRequestOptions() {
    return new Response(null, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
    });
}
