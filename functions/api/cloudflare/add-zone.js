// Add zone to Cloudflare account
export async function onRequestPost(context) {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    try {
        const { domain, cfToken, cfAccountId } = await context.request.json();

        if (!domain || !cfToken || !cfAccountId) {
            return new Response(JSON.stringify({
                error: 'Missing required fields: domain, cfToken, cfAccountId'
            }), { status: 400, headers });
        }

        // Call Cloudflare API to add zone
        const cfResponse = await fetch('https://api.cloudflare.com/client/v4/zones', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${cfToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: domain,
                account: { id: cfAccountId },
                type: 'full'  // Full DNS setup
            })
        });

        const cfData = await cfResponse.json();

        if (!cfData.success) {
            // Check if zone already exists
            const errors = cfData.errors || [];
            const alreadyExists = errors.some(e => e.code === 1061);

            if (alreadyExists) {
                // Zone exists, fetch it instead
                const listResponse = await fetch(
                    `https://api.cloudflare.com/client/v4/zones?name=${domain}&account.id=${cfAccountId}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${cfToken}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                const listData = await listResponse.json();

                if (listData.success && listData.result.length > 0) {
                    const zone = listData.result[0];
                    return new Response(JSON.stringify({
                        success: true,
                        zone_id: zone.id,
                        nameservers: zone.name_servers,
                        status: zone.status,
                        message: 'Zone already exists'
                    }), { status: 200, headers });
                }
            }

            return new Response(JSON.stringify({
                error: errors[0]?.message || 'Failed to add zone',
                details: errors
            }), { status: 400, headers });
        }

        // Success!
        const zone = cfData.result;
        return new Response(JSON.stringify({
            success: true,
            zone_id: zone.id,
            nameservers: zone.name_servers,
            status: zone.status,
            message: 'Zone created successfully'
        }), { status: 200, headers });

    } catch (err) {
        return new Response(JSON.stringify({
            error: err.message
        }), { status: 500, headers });
    }
}

// Handle CORS preflight
export async function onRequestOptions() {
    return new Response(null, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
    });
}
