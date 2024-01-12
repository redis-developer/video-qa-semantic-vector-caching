import { type NextRequest } from 'next/server';

const VIDEO_SEARCH_SERVICE = process.env.VIDEO_SEARCH_SERVICE;
const UPLOAD_API = `${VIDEO_SEARCH_SERVICE}/api/videos`;

export async function POST(request: NextRequest) {
    const res: { videos: string[] } = await request.json();
    const response = await fetch(`${UPLOAD_API}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videos: res.videos ?? [] }),
    });
    const data = await response.json();

    return Response.json({ ...data });
}
