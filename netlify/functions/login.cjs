// Simple authentication - change these credentials!
const VALID_USERS = {
    'admin': 'NGEteam2025!',
    'nge': 'supersecret123'
};

// Generate simple token
function generateToken(username) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    return Buffer.from(`${username}:${timestamp}:${random}`).toString('base64');
}

exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { username, password } = JSON.parse(event.body);

        if (!username || !password) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ success: false, error: 'Username and password required' })
            };
        }

        // Check credentials
        if (VALID_USERS[username] && VALID_USERS[username] === password) {
            const token = generateToken(username);

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    token,
                    message: 'Login successful'
                })
            };
        }

        return {
            statusCode: 401,
            headers,
            body: JSON.stringify({ success: false, error: 'Invalid username or password' })
        };

    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ success: false, error: 'Server error' })
        };
    }
};
