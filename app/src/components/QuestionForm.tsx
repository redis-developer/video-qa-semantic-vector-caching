import { Formik, Form, Field } from 'formik';

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
          <Field as="input" name="question" className="w-full p-4 border rounded shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-600" />
        </Form>
      )}
    </Formik>
  );
}
