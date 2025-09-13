import React, { useContext } from 'react';
import { Form, Button, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import AuthContext from '../../contexts/AuthContext';

const Register = () => {
    const { registerUser } = useContext(AuthContext);

    const handleSubmit = (e) => {
        e.preventDefault();
        const username = e.target.username.value;
        const password = e.target.password.value;
        const password2 = e.target.password2.value;

        if (password !== password2) {
            alert("Passwords don't match!");
            return;
        }
        registerUser(username, password);
    };

    return (
        <Card style={{ width: '25rem' }}>
            <Card.Body>
                <Card.Title className="text-center mb-4">Register</Card.Title>
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Username</Form.Label>
                        <Form.Control type="text" name="username" placeholder="Enter username" required />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Password</Form.Label>
                        <Form.Control type="password" name="password" placeholder="Password" required />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Confirm Password</Form.Label>
                        <Form.Control type="password" name="password2" placeholder="Confirm Password" required />
                    </Form.Group>
                    <Button variant="primary" type="submit" className="w-100">
                        Register
                    </Button>
                </Form>
                <div className="text-center mt-3">
                    <Link to="/login">Already have an account? Login</Link>
                </div>
            </Card.Body>
        </Card>
    );
};

export default Register;