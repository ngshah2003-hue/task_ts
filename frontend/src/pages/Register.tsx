import { useState } from 'react';
import * as Yup from 'yup';
import { useNavigate, Link } from 'react-router-dom';
import { useFormik } from 'formik';
import { Form, Button, Container, Card, InputGroup } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useAppDispatch } from '../store/hooks';
import { setCredentials } from '../store/slices/authSlice';
import * as kanbanApi from '../api/kanbanApi';

const registerSchema = Yup.object().shape({
  name: Yup.string().trim().required('Name is required.').max(100, 'Name is too long.'),
  email: Yup.string()
    .required('Email is required.')
    .email('Email is not valid.'),
  password: Yup.string()
    .required('Password is required.')
    .min(8, 'Must be minimum 8 characters.')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      'Password must include uppercase, lowercase, number and special character.'
    ),
  confirmPassword: Yup.string()
    .required('Confirm password is required.')
    .oneOf([Yup.ref('password')], 'Password and confirm password must match.'),
});

const Register: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: { name: '', email: '', password: '', confirmPassword: '' },
    validationSchema: registerSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const data = await kanbanApi.signup({
          email: values.email,
          password: values.password,
          name: values.name.trim(),
        });
        dispatch(setCredentials({ user: data.user, token: data.token }));
        toast.success('Account created');
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
              <h1 className="h5 mb-2 text-primary fw-bold text-center">Join Kanban</h1>
              <p className="text-muted text-center small mb-4">Create your account to get started</p>
              <Form onSubmit={formik.handleSubmit} noValidate>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-medium">Full Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter your full name"
                    {...formik.getFieldProps('name')}
                    isInvalid={!!(formik.touched.name && formik.errors.name)}
                  />
                  <Form.Control.Feedback type="invalid">{formik.errors.name}</Form.Control.Feedback>
                </Form.Group>
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
                <Form.Group className="mb-3">
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
                <Form.Group className="mb-4">
                  <Form.Label className="small fw-medium">Confirm Password</Form.Label>
                  <InputGroup className={formik.touched.confirmPassword && formik.errors.confirmPassword ? 'is-invalid' : ''}>
                    <Form.Control
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Enter your password again"
                      {...formik.getFieldProps('confirmPassword')}
                      isInvalid={!!(formik.touched.confirmPassword && formik.errors.confirmPassword)}
                    />
                    <InputGroup.Text as="button" type="button" className="bg-white border-start-0" onClick={() => setShowConfirmPassword((p) => !p)} aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}>
                      <i className={showConfirmPassword ? 'bi bi-eye-slash text-muted' : 'bi bi-eye text-muted'} />
                    </InputGroup.Text>
                  </InputGroup>
                  <Form.Control.Feedback type="invalid">{formik.errors.confirmPassword}</Form.Control.Feedback>
                </Form.Group>
                <Button
                  type="submit"
                  variant="primary"
                  className="w-100 py-2 fw-semibold text-uppercase"
                  disabled={loading}
                >
                  {loading ? 'Creating account…' : 'REGISTER'}
                </Button>
                <p className="text-center small text-muted mt-4 mb-0">
                  Already have an account? <Link to="/login" className="text-primary text-decoration-none fw-medium">Sign in</Link>
                </p>
              </Form>
            </Card.Body>
          </Card>
        </div>
      </Container>
    </div>
  );
};

export default Register;
