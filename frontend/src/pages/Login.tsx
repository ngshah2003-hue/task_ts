import { useState } from 'react';
import * as Yup from 'yup';
import { useNavigate, Link } from 'react-router-dom';
import { useFormik } from 'formik';
import { Form, Button, Container, Card, InputGroup } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useAppDispatch } from '../store/hooks';
import { setCredentials } from '../store/slices/authSlice';
import * as kanbanApi from '../api/kanbanApi';

const loginSchema = Yup.object().shape({
  email: Yup.string()
    .required('Email is required.')
    .email('Email is not valid.'),
  password: Yup.string()
    .required('Password is required.')
    .min(8, 'Must be minimum 8 characters.'),
});

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema: loginSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const data = await kanbanApi.login(values.email, values.password);
        dispatch(setCredentials({ user: data.user, token: data.token }));
        toast.success('Signed in successfully');
        navigate('/dashboard');
      } catch (err) {
        toast.error(kanbanApi.getApiError(err));
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <div className="min-vh-100 bg-light d-flex align-items-center py-5">
      <Container>
        <div className="d-flex justify-content-center">
          <Card className="shadow-sm border-0 rounded-3" style={{ maxWidth: 420, width: '100%' }}>
            <Card.Body className="p-4 p-md-5">
              <div className="text-center mb-4">
                <div className="d-inline-flex align-items-center justify-content-center rounded bg-primary text-white fw-bold mb-2" style={{ width: 48, height: 48 }}>K</div>
                <div className="fw-bold text-dark">Kanban</div>
                <div className="small text-muted">Simple Kanban</div>
              </div>
              <h1 className="h5 mb-2 text-primary fw-bold text-center">Sign in</h1>
              <p className="text-muted text-center small mb-4">Enter your credentials to access your boards</p>
              <Form onSubmit={formik.handleSubmit} noValidate>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-medium">Email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter your email"
                    {...formik.getFieldProps('email')}
                    isInvalid={!!(formik.touched.email && formik.errors.email)}
                  />
                  <Form.Control.Feedback type="invalid">{formik.errors.email}</Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mb-4">
                  <Form.Label className="small fw-medium">Password</Form.Label>
                  <InputGroup className={formik.touched.password && formik.errors.password ? 'is-invalid' : ''}>
                    <Form.Control
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      {...formik.getFieldProps('password')}
                      isInvalid={!!(formik.touched.password && formik.errors.password)}
                    />
                    <InputGroup.Text as="button" type="button" className="bg-white border-start-0" onClick={() => setShowPassword((p) => !p)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                      <i className={showPassword ? 'bi bi-eye-slash text-muted' : 'bi bi-eye text-muted'} />
                    </InputGroup.Text>
                  </InputGroup>
                  <Form.Control.Feedback type="invalid">{formik.errors.password}</Form.Control.Feedback>
                </Form.Group>
                <Button
                  type="submit"
                  variant="primary"
                  className="w-100 py-2 fw-semibold text-uppercase"
                  disabled={loading}
                >
                  {loading ? 'Signing in…' : 'Sign in'}
                </Button>
                <p className="text-center small text-muted mt-4 mb-0">
                  No account? <Link to="/register" className="text-primary text-decoration-none fw-medium">Sign up</Link>
                </p>
              </Form>
            </Card.Body>
          </Card>
        </div>
      </Container>
    </div>
  );
};

export default Login;
