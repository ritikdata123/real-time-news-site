import React, { useContext, useState } from 'react';
import axios from 'axios';
import { Form, Button, Container } from 'react-bootstrap';
import { UserContext } from '../App';
import { useNavigate } from 'react-router-dom';
import "./Register.css";

const Login = () => {
  const [email, setemail] = useState<string>("");
  const [password, setpassword] = useState<string>("");
  const [loading, setloading] = useState<boolean>(false);

  const { setUser } = useContext(UserContext);

  const navigate = useNavigate();

  const handleclick = (): void => {
    navigate("/register");
  }

  const handlesubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setloading(true);

    try {
      const response = await axios.post('http://localhost:3001/api/user/login', {
        email,
        password,
      });

      if (response.status === 200) {
        localStorage.setItem('token', response.data.token);
        alert("Login successful. Welcome to our site");
        setUser(email); 
        navigate('/'); 
      } else {
        alert("Login failed. Please check it once");
        console.log('Login failed response:', response.data);
      }
    } catch (err: any) {
      console.error('Error during login:', err);
      if (err.response && err.response.data) {
        alert("Something is wrong, please check your credentials");
      }
    } finally {
      setTimeout(() => {
        setloading(false);
      }, 1000);
    }
  };

  return (
    <>
      <Container className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="box1 p-4 shadow rounded">
          <h2 className="text-center mb-4 text-primary">Login</h2>
          <Form onSubmit={handlesubmit}>
            <Form.Group controlId="email">
              <Form.Label className="fw-bold">Email</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => setemail(e.target.value)}
                required
                className="mb-3"
              />
            </Form.Group>

            <Form.Group controlId="password">
              <Form.Label className="fw-bold">Password</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setpassword(e.target.value)}
                required
                className="mb-3"
              />
            </Form.Group>
            
            <div className="d-flex justify-content-between mt-4">
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? 'Checking...' : 'Login'}
              </Button>
              <Button variant="secondary" onClick={handleclick} disabled={loading}>
                Register
              </Button>
            </div>
          </Form>
        </div>
      </Container>
    </>
  );
};

export default Login;
