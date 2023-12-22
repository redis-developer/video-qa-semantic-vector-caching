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
          <Field as="textarea" name="question" />
          <button type="submit" disabled={isSubmitting}>
            Submit
          </button>
        </Form>
      )}
    </Formik>
  );
}
