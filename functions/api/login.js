// Simple authentication - change these credentials!
// ideally move to env vars, but keeping as is for direct port
const VALID_USERS = {
    'admin': 'NGEteam2025!',
    'nge': 'supersecret123'
};

// Generate simple token
function generateToken(username) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    // Cloudflare Workers don't have Buffer as global, likely need polyfill or btoa
    // But modern Workers env supports Buffer usually? Or TextEncoder?
    // Let's use btoa for base64 which is standard web API.
    return btoa(`${username}:${timestamp}:${random}`);
}

export async function onRequestPost(context) {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    try {
        const { username, password } = await context.request.json();

        if (!username || !password) {
            return new Response(JSON.stringify({ success: false, error: 'Username and password required' }), { status: 400, headers });
        }

        // Check credentials
        if (VALID_USERS[username] && VALID_USERS[username] === password) {
            const token = generateToken(username);

            return new Response(JSON.stringify({
                success: true,
                token,
                message: 'Login successful'
            }), { status: 200, headers });
        }

        return new Response(JSON.stringify({ success: false, error: 'Invalid username or password' }), { status: 401, headers });

    } catch (error) {
        return new Response(JSON.stringify({ success: false, error: 'Server error' }), { status: 500, headers });
    }
}

// Handle OPTIONS
export async function onRequestOptions() {
    return new Response(null, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
    });
}
