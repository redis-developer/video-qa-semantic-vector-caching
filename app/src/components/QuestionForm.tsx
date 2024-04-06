import { Formik, Form, Field } from 'formik';
import CircularProgress from './CircularProgress';

interface QuestionFormProps {
  onSubmit: (question: string) => Promise<void> | void;
}

export default function QuestionForm({ onSubmit }: QuestionFormProps) {
  return (
    <Formik
      initialValues={{ question: '' }}
      onSubmit={async (values, { setSubmitting }) => {
        await onSubmit(values.question);
        setSubmitting(false);
      }}>
      {({
        isSubmitting,
        /* and other goodies */
      }) => (
        <Form>
          <div className="relative">
            <Field
              as="input"
              name="question"
              className="w-full p-4 pl-10 border rounded shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
            <button
              type="submit"
              className="absolute inset-y-0 right-0 px-4 text-white bg-indigo-600 rounded-r hover:bg-indigo-700 focus:outline-none focus:bg-indigo-700">
              {isSubmitting ? (
                <CircularProgress />
              ) : (
                <svg
                  className="w-6 h-6 fill-current"
                  xmlns="http://www.w3.org/2000/svg"
                  x="0px"
                  y="0px"
                  width="100"
                  height="100"
                  viewBox="0 0 50 50">
                  <path d="M 21 3 C 11.621094 3 4 10.621094 4 20 C 4 29.378906 11.621094 37 21 37 C 24.710938 37 28.140625 35.804688 30.9375 33.78125 L 44.09375 46.90625 L 46.90625 44.09375 L 33.90625 31.0625 C 36.460938 28.085938 38 24.222656 38 20 C 38 10.621094 30.378906 3 21 3 Z M 21 5 C 29.296875 5 36 11.703125 36 20 C 36 28.296875 29.296875 35 21 35 C 12.703125 35 6 28.296875 6 20 C 6 11.703125 12.703125 5 21 5 Z"></path>
                </svg>
              )}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
