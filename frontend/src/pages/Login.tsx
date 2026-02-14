import { useState } from 'react';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import { Form, Button, Container, Card } from 'react-bootstrap';
import APICallService from '../api/apiCallService';
import { LOGIN } from '../api/apiEndPoints';
import { APIJSON } from '../api/apiJSON/auth';
import { success } from '../utils/toast';
import { Auth } from '../utils/toast';
import { useAuth } from '../app/auth';

const loginSchema = Yup.object().shape({
  email: Yup.string()
    .required('Email is required')
    .matches(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/, 'Invalid email address'),
  password: Yup.string().min(8, 'Minimum 8 characters').required('Password is required'),
});

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { saveAuth, saveCurrentUser } = useAuth();
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema: loginSchema,
    onSubmit: async (values, { setStatus, setSubmitting }) => {
      setLoading(true);
      const apiService = new APICallService(LOGIN, APIJSON.login({ email: values.email, password: values.password }));
      const response = (await apiService.callAPI()) as { token?: string; user?: { _id: string } } | number | null;
      if (response && typeof response === 'object' && response.token) {
        saveAuth(response.token);
        if (response.user) saveCurrentUser(response.user);
        success(Auth.login);
        navigate('/dashboard');
      } else {
        setStatus('Invalid email or password.');
        saveAuth(undefined);
        saveCurrentUser(undefined);
      }
      setLoading(false);
      setSubmitting(false);
    },
  });

  return (
    <Container className="d-flex align-items-center justify-content-center login-page">
      <Card className="login-card p-4 w-100 animate-fade-in">
        <Card.Body className="p-0">
          <div className="text-center mb-4">
            <div className="app-logo">A</div>
            <h1 className="app-brand">Admin</h1>
            <p className="app-tagline">Sign in to continue</p>
          </div>
          <Form onSubmit={formik.handleSubmit} noValidate>
            <Form.Group className="mb-3">
              <Form.Control
                placeholder="Email"
                type="email"
                {...formik.getFieldProps('email')}
                isInvalid={!!(formik.touched.email && formik.errors.email)}
              />
              <Form.Control.Feedback type="invalid">{formik.errors.email}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Control
                placeholder="Password"
                type="password"
                {...formik.getFieldProps('password')}
                isInvalid={!!(formik.touched.password && formik.errors.password)}
              />
              <Form.Control.Feedback type="invalid">{formik.errors.password}</Form.Control.Feedback>
            </Form.Group>
            <Button
              type="submit"
              className="w-100"
              variant="primary"
              disabled={formik.isSubmitting || !formik.isValid}
            >
              {loading ? (
                <>
                  Please wait...
                  <span className="spinner-border spinner-border-sm align-middle ms-2" role="status" aria-hidden="true" />
                </>
              ) : (
                'Login'
              )}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Login;
