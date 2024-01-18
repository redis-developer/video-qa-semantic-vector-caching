import { type NextRequest } from 'next/server';

const VIDEO_SEARCH_SERVICE = process.env.VIDEO_SEARCH_SERVICE;
const SEARCH_API = `${VIDEO_SEARCH_SERVICE}/api/videos/search`;

export async function GET(request: NextRequest) {
    const response = await fetch(`${SEARCH_API}${request.nextUrl.search}`);
    const data = await response.json();

    return Response.json(data);
}
