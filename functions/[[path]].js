import { createSupabaseClient } from './utils/supabase';

// Bot detection
function isBot(userAgent) {
    if (!userAgent) return true;
    const ua = userAgent.toLowerCase();
    const bots = [
        'facebookexternalhit', 'twitterbot', 'whatsapp', 'linkedinbot',
        'pinterest', 'slackbot', 'telegrambot', 'discordbot', 'googlebot',
        'bingbot', 'yandex', 'duckduckgo', 'baidu', 'ahern', 'instagram',
        'mj12bot', 'semrush', 'ahrefs', 'dotbot', 'rogerbot', 'exabot'
    ];
    return bots.some(bot => ua.includes(bot));
}

// OS Detection
function detectOS(userAgent) {
    if (!userAgent) return 'Unknown';
    const ua = userAgent.toLowerCase();
    if (ua.includes('iphone') || ua.includes('ipad')) return 'iOS';
    if (ua.includes('android')) return 'Android';
    if (ua.includes('windows phone')) return 'Windows Phone';
    if (ua.includes('windows')) return 'Windows';
    if (ua.includes('mac os') || ua.includes('macintosh')) return 'macOS';
    if (ua.includes('linux')) return 'Linux';
    if (ua.includes('cros')) return 'Chrome OS';
    return 'Unknown';
}

// Browser/App Detection
function detectBrowser(userAgent) {
    if (!userAgent) return 'Unknown';
    const ua = userAgent.toLowerCase();

    // Social Apps (In-App Browsers) - Priority
    // Facebook: FBAV (iOS), FBAN (Android), FBIAB (In-App Browser)
    if (ua.includes('fbav') || ua.includes('fban') || ua.includes('fbiab') || ua.includes('facebook')) return 'Facebook';
    if (ua.includes('instagram')) return 'Instagram';
    if (ua.includes('tiktok') || ua.includes('musical_ly')) return 'TikTok'; // musical_ly is old tiktok
    if (ua.includes('line')) return 'Line';
    if (ua.includes('whatsapp')) return 'WhatsApp';
    if (ua.includes('snapchat')) return 'Snapchat';
    if (ua.includes('twitter') || ua.includes('cfnetwork')) return 'Twitter'; // CFNetwork sometimes indicates iOS app

    // Standard Browsers
    if (ua.includes('chrome') && !ua.includes('edg') && !ua.includes('opr') && !ua.includes('crios')) return 'Chrome';
    if (ua.includes('crios')) return 'Chrome'; // Chrome on iOS
    if (ua.includes('safari') && !ua.includes('chrome') && !ua.includes('crios') && !ua.includes('fban') && !ua.includes('fbav')) return 'Safari';
    if (ua.includes('firefox') || ua.includes('fxios')) return 'Firefox';
    if (ua.includes('edg') || ua.includes('edge')) return 'Edge';
    if (ua.includes('opr') || ua.includes('opera')) return 'Opera';
    if (ua.includes('trident') || ua.includes('msie')) return 'Internet Explorer';
    if (ua.includes('ucbrowser') || ua.includes('ucweb')) return 'UC Browser';

    return 'Other';
}

async function recordClick(supabase, link, request) {
    const userAgent = request.headers.get('user-agent') || '';
    const referer = request.headers.get('referer') || '';

    // Skip bot tracking
    if (isBot(userAgent)) return;

    // 1. Extract explicit click_id from Request URL (Dynamic - Highest Priority)
    const requestUrl = new URL(request.url);
    let clickId = requestUrl.searchParams.get('click_id') ||
        requestUrl.searchParams.get('clickid') ||
        requestUrl.searchParams.get('subid');

    // 2. If no explicit ID in request, check Target URL (Static/Hardcoded - Medium Priority)
    if (!clickId && link.original_url) {
        try {
            const targetUrl = new URL(link.original_url);
            clickId = targetUrl.searchParams.get('click_id') ||
                targetUrl.searchParams.get('clickid') ||
                targetUrl.searchParams.get('subid');
        } catch (e) { /* ignore */ }
    }

    // 3. Fallback to Ad Network IDs (Lowest Priority - only if no other ID exists)
    // This prevents fbclid/gclid from overwriting a hardcoded "ALCEMEIST-noGEN"
    if (!clickId) {
        clickId = requestUrl.searchParams.get('gclid') ||
            requestUrl.searchParams.get('fbclid');
    }

    const country = request.cf?.country || 'XX';
    const ip = request.headers.get('cf-connecting-ip') || '0.0.0.0';
    const os = detectOS(userAgent);
    let browser = detectBrowser(userAgent);

    // Fallback: If browser is generic standard but Referrer indicates a social platform, use that.
    // This helps when apps open links in external browsers (Chrome/Safari) or mask UA.
    if (browser === 'Chrome' || browser === 'Safari' || browser === 'Other' || browser === 'Unknown') {
        const ref = referer.toLowerCase();
        if (ref.includes('instagram.com')) browser = 'Instagram';
        else if (ref.includes('facebook.com')) browser = 'Facebook';
        else if (ref.includes('t.co') || ref.includes('twitter.com')) browser = 'Twitter';
        else if (ref.includes('linkedin.com')) browser = 'LinkedIn';
        else if (ref.includes('tiktok.com')) browser = 'TikTok';
    }

    try {
        await supabase.from('clicks').insert({
            link_id: link.id,
            slug: link.slug,
            country: country,
            user_agent: userAgent.substring(0, 500),
            ip_address: ip,
            click_id: clickId,
            os: os,
            browser: browser,
            referer: referer
        });
    } catch (err) {
        console.error('Click tracking error:', err);
    }
}

export async function onRequest(context) {
    const url = new URL(context.request.url);
    const path = url.pathname.replace(/^\/+|\/+$/g, ''); // Remove leading/trailing slashes

    // Passthrough for API, assets, files (with extension), or root
    if (path.startsWith('api/') || path.startsWith('assets/') || path === '' || path.includes('.')) {
        return context.next();
    }

    const supabase = createSupabaseClient(context.env);

    // 1. Fetch Link
    const { data: link, error } = await supabase
        .from('links')
        .select(`
            *,
            domains ( url )
        `)
        .eq('slug', path)
        .single();

    if (error || !link) {
        // Not found -> pass to frontend (SPA 404)
        return context.next();
    }

    // 2. Anti-Spam / Bot Check
    const userAgent = context.request.headers.get('user-agent');
    if (!userAgent) {
        return new Response('Access Denied', { status: 403 });
    }

    // 3. Track Click (Non-blocking)
    context.waitUntil(recordClick(supabase, link, context.request));

    // 4. Geo Blocking
    const country = context.request.cf?.country || 'XX';
    if (link.block_indonesia && country === 'ID') {
        const domainUrl = link.domains?.url || 'https://google.com';
        // Add protocol if missing
        const redirectUrl = domainUrl.startsWith('http') ? domainUrl : `https://${domainUrl}`;
        return Response.redirect(redirectUrl, 302);
    }

    // 5. Final Redirect
    let target = link.original_url;
    // Append query params from request to target
    if (url.search) {
        const targetUrl = new URL(target);
        const requestParams = new URL(context.request.url).searchParams;
        requestParams.forEach((value, key) => {
            targetUrl.searchParams.append(key, value);
        });
        target = targetUrl.toString();
    }

    return Response.redirect(target, 302);
}
