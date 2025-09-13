import React, { useContext } from 'react';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import AuthContext from '../../contexts/AuthContext';

const AppNavbar = () => {
    const { user, logoutUser } = useContext(AuthContext);

    return (
        <Navbar bg="primary" variant="dark" expand="lg">
            <Container>
                <Navbar.Brand as={Link} to="/">ChatterBox</Navbar.Brand>
                <Nav className="ms-auto">
                    {user ? (
                        <NavDropdown title={`Hello, ${user?.username}`} id="basic-nav-dropdown">
                            <NavDropdown.Item onClick={logoutUser}>Logout</NavDropdown.Item>
                        </NavDropdown>
                    ) : (
                        <>
                            <Nav.Link as={Link} to="/login">Login</Nav.Link>
                            <Nav.Link as={Link} to="/register">Register</Nav.Link>
                        </>
                    )}
                </Nav>
            </Container>
        </Navbar>
    );
};

export default AppNavbar;