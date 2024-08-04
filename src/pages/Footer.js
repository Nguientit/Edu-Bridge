import { Link } from 'react-router-dom';
import React from 'react';
import { Dropdown } from 'react-bootstrap';

export default function Footer() {
    return (
        <div className="container-fluid text-bg-dark">
        <footer>
            <div className="container pt-5 pb-5"style={{maxWidth: "1840px"}}>
                <div className="row g-4">
                    <div className="col-3">
                        <a className="text-light" href="#" target="_blank" rel="noopener noreferrer">Contact us</a><br />
                        <a className="text-light" href="#" target="_blank" rel="noopener noreferrer">About us</a>
                    </div>
                    <div className="col-3">
                        <a className="text-light" href="#" target="_blank" rel="noopener noreferrer">Terms of Use</a><br />
                        <a className="text-light" href="#" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
                    </div>
                    <div className="col-6 d-flex flex-row-reverse">
                        <Dropdown>
                            <Dropdown.Toggle variant="outline-secondary" className="border text-light" id="dropdown-language">
                            <i class="bi bi-globe"></i> English
                            </Dropdown.Toggle>
                            <Dropdown.Menu align="end" className="p-0">
                                <Dropdown.Item>
                                    <img
                                        style={{ transform: 'translateY(-10%)', width: '1.0rem' }}
                                        src="view/assets/images/united-states.png"
                                        alt="English"
                                    /> English
                                </Dropdown.Item>
                                <Dropdown.Item>
                                    <img
                                        style={{ transform: 'translateY(-10%)', width: '1.0rem' }}
                                        src="view/assets/images/vietnam.png"
                                        alt="Tiếng Việt"
                                    /> Tiếng Việt
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                    <div className="col-12">
                        <span>© 2024, GitHub/PhanDinhTuan</span>
                    </div>
                </div>
            </div>
        </footer>
    </div>
       

    );
}