import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export default function Search() {
    const location = useLocation();
    const query = new URLSearchParams(location.search).get("query") || "";

    const [Courses, setCourses] = useState([]);
    const [Instructors, setInstructors] = useState([]);
    const [Profiles, setProfiles] = useState([]);
    const [sortType, setSortType] = useState('rating');
    const [sortDirection, setSortDirection] = useState('asc');

    const [paidFilter, setPaidFilter] = useState(false);
    const [freeFilter, setFreeFilter] = useState(false);
    const handleChange = (event) => {
        const { name, checked } = event.target;
        if (name === 'paid') {
            setPaidFilter(checked);
        } else if (name === 'free') {
            setFreeFilter(checked);
        }
    };

    useEffect(() => {
        fetch("http://localhost:9999/Courses")
            .then(res => res.json())
            .then(result => setCourses(result))
            .catch(err => console.log(err));

        fetch("http://localhost:9999/Instructors")
            .then(res => res.json())
            .then(result => setInstructors(result))
            .catch(err => console.log(err));

        fetch("http://localhost:9999/Profiles")
            .then(res => res.json())
            .then(result => setProfiles(result))
            .catch(err => console.log(err));
    }, []);


    const filteredCourses = Courses.filter(course =>
        course.courseName.toLowerCase().includes(query.toLowerCase())
    ).filter(course => {
        if (paidFilter && freeFilter) {
            return true;
        } else if (paidFilter) {
            return course.price >0;
        } else if (freeFilter) {
            return course.price ===0;
        } else {
            return true; 
        }
    });

    // Function to handle sorting
    const handleSort = (type) => {
        // Toggle sort direction if the same type is clicked again
        if (sortType === type) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            // Default to ascending order when switching type
            setSortType(type);
            setSortDirection('asc');
        }
    };
    // Sort filteredCourses based on sortType and sortDirection
    const sortedCourses = [...filteredCourses].sort((a, b) => {
        if (sortType === 'newest') {
            // Assuming 'createdAt' or similar field for determining newest
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
        } else if (sortType === 'highest') {
            return sortDirection === 'asc' ? a.price - b.price : b.price - a.price;
        } else if (sortType === 'lowest') {
            return sortDirection === 'asc' ? b.price - a.price : a.price - b.price;
        } else {
            // Default or 'rating' sorting
            // Implement your own logic based on the 'rating' field or similar
            return sortDirection === 'asc' ? a.rating - b.rating : b.rating - a.rating;
        }
    });


    return (
        <div className="container pt-5 pb-5" style={{ maxWidth: "1840px" }}>
            <div className="col-12">
                <h5>Search Results for "{query}"</h5>
                {/* <input type="hidden" name="key" value={param.key} /> */}
            </div>
            <div className="row">
                <div className="col-3">
                    <div style={{ display: "flex" }}>
                        <select name="sort" className="form-select" style={{ width: '150px' }} onChange={(e) => handleSort(e.target.value)}>
                            <option value="rating">Highest rated</option>
                            <option value="newest">Newest</option>
                            <option value="lowest">Highest price first</option>
                            <option value="highest">Lowest price first</option>
                        </select>
                        <button className="btn text-secondary" type="button">Clear filter</button>
                    </div>

                    <hr />
                    <details open="true">
                        <summary>
                            <h5>Ratings</h5>
                        </summary>
                        <div class="form-check mb-2">
                            <input class="form-check-input rounded-5" type="radio" name="rating2" value="4.5" id="45up" />
                            <label class="form-check-label" for="45up">
                                4.5 & up
                                <i class="bi bi-star-fill"></i>
                                <i class="bi bi-star-fill"></i>
                                <i class="bi bi-star-fill"></i>
                                <i class="bi bi-star-fill"></i>
                                <i class="bi bi-star-half"></i>
                            </label>
                        </div>
                        <div class="form-check mb-2">
                            <input class="form-check-input rounded-5" type="radio" name="rating2" value="4.0" id="4up" />
                            <label class="form-check-label" for="4up">
                                4.0 & up
                                <i class="bi bi-star-fill"></i>
                                <i class="bi bi-star-fill"></i>
                                <i class="bi bi-star-fill"></i>
                                <i class="bi bi-star-fill"></i>
                                <i class="bi bi-star"></i>
                            </label>
                        </div>
                        <div class="form-check">
                            <input class="form-check-input rounded-5 mb-2" type="radio" name="rating2" value="3.5" id="35up" />
                            <label class="form-check-label" for="35up">
                                3.5 & up
                                <i class="bi bi-star-fill"></i>
                                <i class="bi bi-star-fill"></i>
                                <i class="bi bi-star-fill"></i>
                                <i class="bi bi-star-half"></i>
                                <i class="bi bi-star"></i>
                            </label>
                        </div>
                    </details>
                    <hr />
                    <input type="hidden" name="key" value="${param.key}" />
                    <details>
                        <summary>
                            <h5>Price</h5>
                        </summary>
                        <div className="form-check mb-2">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                value={paidFilter}
                                checked={paidFilter}
                                onChange={handleChange}
                                name="paid"
                                id="paid"
                            />
                            <label className="form-check-label" htmlFor="paid">
                                Paid
                            </label>
                        </div>
                        <div className="form-check mb-2">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                value={freeFilter}
                                checked={freeFilter}
                                onChange={handleChange}
                                name="free"
                                id="free"
                            />
                            <label className="form-check-label" htmlFor="free">
                                Free
                            </label>
                        </div>
                    </details>

                </div>

                <div className="col-9" style={{ marginTop: '-0.4rem' }} id="searchResults">
                    <div className="row gy-3">
                        {sortedCourses.map(course => {
                            let priceDisplay;
                            if (course.price > 0) {
                                priceDisplay = <p><i className="bi bi-currency-dollar"></i> {course.price}</p>;
                            } else {
                                priceDisplay = <p>Free</p>;
                            }

                            const instructor = Instructors.find(instr => instr.id == course.instrucotor)?.emailAddress;
                            const profile = Profiles.find(p => p.emailAddress == instructor)?.fullName;

                            return (
                                <div className="col-12" key={course.id}>
                                    <div className="row">
                                        <div className="col-4">
                                            <div className="ratio ratio-16x9">
                                                <img className="w-100" src={course.thumbnail} alt="Course Thumbnail" />
                                            </div>
                                        </div>
                                        <div className="col-6">
                                            <h4>{course.courseName}</h4>
                                            <div className="text-truncate">
                                                <h5>{course.tagLine}</h5>
                                            </div>
                                            <h5 style={{ opacity: "0.5" }}>{profile}</h5>
                                        </div>
                                        <div className="col-2">
                                            {priceDisplay}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}