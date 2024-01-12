import { Formik, Form, Field, FieldArray } from 'formik';

export interface VideoFormProps {
  onSubmit: (videos: string[]) => Promise<void> | void;
}

function VideoForm({ onSubmit }: VideoFormProps) {
  return (
    <Formik
      initialValues={{ videos: [''] }}
      onSubmit={(values) => {
        void onSubmit(values.videos);
      }}>
      {({ values }) => (
        <Form className="space-y-4">
          <FieldArray name="videos">
            {({ insert, remove }) => (
              <div>
                {values.videos.map((video, index) => (
                  <div
                    key={index}
                    className="flex flex-wrap items-center gap-2">
                    <Field
                      name={`videos.${index}`}
                      placeholder="Enter YouTube URL"
                      className="flex-1 px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    />
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none">
                      Remove
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        insert(index, '');
                      }}
                      className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none">
                      Add
                    </button>
                  </div>
                ))}
              </div>
            )}
          </FieldArray>
          <div className="flex justify-center">
            <button
              type="submit"
              className="py-2 px-4 bg-indigo-600 text-white rounded hover:bg-indigo-700 focus:outline-none">
              Submit
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
}

export default VideoForm;
