import { Formik, Form, Field } from 'formik';
import CircularProgress from './CircularProgress';

export interface VideoFormProps {
  onSubmit: (videos: string[]) => Promise<void> | void;
}

function VideoForm({ onSubmit }: VideoFormProps) {
  const isValidYouTubeUrlOrId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)?([^#&?]*).*/;
    const match = url.match(regExp);
    return (
      Array.isArray(match) && (match[2].length === 11 || url.length === 11)
    );
  };

  const validateYouTubeLinks = ({ videos }: { videos: string }) => {
    const errors: { videos?: string } = {};
    if (typeof videos !== 'string') {
      errors.videos = 'Please enter YouTube links.';

      return errors;
    }

    const urls = videos.split(',');
    const invalidUrls = urls.filter(
      (url) => !isValidYouTubeUrlOrId(url.trim()),
    );

    if (invalidUrls.length > 0) {
      errors.videos = [
        'The following values are not valid YouTube IDs or links.',
        ...invalidUrls,
      ].join(',');

      return errors;
    }
  };

  return (
    <Formik
      initialValues={{ videos: '' }}
      onSubmit={async ({ videos }, { setSubmitting }) => {
        const videoIds = videos.split(',').map((url) => url.trim());
        setSubmitting(true);
        try {
          await onSubmit(videoIds);
        } catch (e) {}
        setSubmitting(false);
      }}
      validate={validateYouTubeLinks}>
      {({ errors, touched, isSubmitting }) => (
        <Form>
          <Field
            name="videos"
            as="textarea"
            placeholder="Enter comma-separated YouTube links or IDs, e.g., https://youtu.be/dQw4w9WgXcQ, 3fumBcKC6RE"
            className="w-full p-2 border rounded shadow-sm"
          />
          {typeof errors.videos === 'string' && touched.videos === true && (
            <ul>
              {errors.videos.split(',').map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          )}
          {isSubmitting
? (
            <button
              onClick={(e) => {
                e.preventDefault();
              }}
              className="mt-2 bg-blue-500 text-white p-2 rounded">
              <CircularProgress />
            </button>
          )
: (
            <button
              type="submit"
              className="mt-2 bg-blue-500 text-white p-2 rounded">
              Submit
            </button>
          )}
        </Form>
      )}
    </Formik>
  );
}

export default VideoForm;
