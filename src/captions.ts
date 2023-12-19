import fs from 'fs-extra';

export interface CaptionData {
    id: string;
    fileName: string;
    link: string;
    captions: string;
}

export async function getCaptionData() {
    const files = await fs.readdir('captions');

    return await Promise.all(files.map(async (file) => {
        const text = await fs.readFile(`captions/${file}`, 'utf-8');
        const id = file.split('.')[0];
        return {
            id,
            fileName: file,
            link: `https://youtu.be/${id}`,
            captions: text,
        };
    }));
}