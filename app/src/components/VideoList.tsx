import Image from 'next/image';

export interface VideoDocument {
  pageContent: string
  metadata: {
    id: string
    link: string
    title: string
    description: string
    thumbnail: string
  }
}

const VideoList = ({ videos }: { videos: VideoDocument[] }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
      {videos.map(({ metadata }) => (
        <div
          key={metadata.id}
          className="max-w-sm rounded overflow-hidden shadow-lg">
          <div className="w-full">
            <Image
              src={metadata.thumbnail}
              alt={metadata.title}
              layout="responsive"
              width={1280}
              height={720}
            />
          </div>
          <div className="px-6 py-4">
            <a
              href={metadata.link}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-xl mb-2 hover:text-indigo-600">
              {metadata.title}
            </a>
          </div>
        </div>
      ))}
    </div>
  );
};

export default VideoList;
