import { type NextRequest } from 'next/server';

const VIDEO_SEARCH_SERVICE = process.env.VIDEO_SEARCH_SERVICE;
const SEARCH_API = `${VIDEO_SEARCH_SERVICE}/api/videos/search`;

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const question = searchParams.get('question');
    console.log(`${SEARCH_API}?question=${question}`);
    const response = await fetch(`${SEARCH_API}?question=${question}`);
    const data = await response.json();

    return Response.json({ ...data });
}
