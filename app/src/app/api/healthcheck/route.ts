import { type NextRequest } from 'next/server';

const VIDEO_SEARCH_SERVICE = process.env.VIDEO_SEARCH_SERVICE;
const HEALTHCHECK_API = `${VIDEO_SEARCH_SERVICE}/api/healthcheck`;

export async function GET(request: NextRequest) {
    try {
        const start = Date.now();
        const response = await fetch(HEALTHCHECK_API);

        if (!response.ok) {
            throw new Error('Unexpected response');
        }

        const data = await response.json();
        const ms = Date.now() - start;

        return Response.json({
            ...data,
            searchApi: {
                status: 'ok',
                ms,
            },
        });
    } catch (e) {
        return Response.json(
            {
                status: 'error',
                redis: {
                    status: 'error',
                },
            },
            {
                status: 500,
            },
        );
    }
}
