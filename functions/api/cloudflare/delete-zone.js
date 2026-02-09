// Delete zone from Cloudflare
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

        // 1. Get Zone ID for the domain
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

        if (!listData.success || listData.result.length === 0) {
            // Zone not found in Cloudflare, maybe already deleted?
            // Consider success so UI can proceed
            return new Response(JSON.stringify({
                success: true,
                message: 'Zone not found in Cloudflare (might be already deleted)'
            }), { status: 200, headers });
        }

        const zoneId = listData.result[0].id;

        // 2. Delete Zone
        const deleteResponse = await fetch(
            `https://api.cloudflare.com/client/v4/zones/${zoneId}`,
            {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${cfToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const deleteData = await deleteResponse.json();

        if (!deleteData.success) {
            return new Response(JSON.stringify({
                error: deleteData.errors?.[0]?.message || 'Failed to delete zone'
            }), { status: 400, headers });
        }

        return new Response(JSON.stringify({
            success: true,
            id: deleteData.result.id,
            message: 'Zone deleted from Cloudflare'
        }), { status: 200, headers });

    } catch (err) {
        return new Response(JSON.stringify({
            error: err.message
        }), { status: 500, headers });
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
