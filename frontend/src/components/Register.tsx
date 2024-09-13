import React, { useState } from 'react';
import axios from 'axios';
import { Form, Button, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import "./Register.css";

const Register = () => {
  const [name, setname] = useState<string>("");
  const [email, setemail] = useState<string>("");
  const [password, setpassword] = useState<string>("");
  const [loading, setloading] = useState<boolean>(false);

  const navigate = useNavigate();

  const handleclick = (): void => {
    navigate("/login");
  }

  const handlesubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setloading(true);

    try {
      const response = await axios.post('http://localhost:3001/api/user/register', {
        name,
        email,
        password,
      });

      console.log("Response from server:", response);

      if (response.status === 200) {
        alert("Registration successful");
        navigate("/login");
      } else {
        alert("Registration failed.");
        console.log('Registration failed response:', response.data);
      }
    } catch (err: any) {
      console.error("Error during registration:", err);
    } finally {
      setTimeout(() => {
        setloading(false);
      }, 2000);
    }
  };

  return (
    <>
      <Container className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="box1 p-4 shadow rounded">
          <h2 className="text-center mb-4 text-primary">Register</h2>
          <Form onSubmit={handlesubmit}>
            <Form.Group controlId="name">
              <Form.Label className="fw-bold">Name</Form.Label>
              <Form.Control
                type="text"
                value={name}
                onChange={(e) => setname(e.target.value)}
                required
                className="mb-3"
              />
            </Form.Group>

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
                {loading ? 'Registering...' : 'Register'}
              </Button>
              <Button variant="secondary" onClick={handleclick} disabled={loading}>
                Login
              </Button>
            </div>
          </Form>
        </div>
      </Container>
    </>
  );
};

export default Register;
