import './App.css';
import React, { useState, useEffect } from 'react';
import Modal from './components/Modal';
import HospitalMap from './components/HospitalMap';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import { fetchHospitalsFromOverpass } from './services/hospitalService';


// HospitalList now receives selectedHospital and onSelectHospital for highlighting and selection
const HospitalList = ({ hospitals, selectedHospital, onSelectHospital }) => {
  // Handles click: toggles selection off if same hospital is clicked
  const handleItemClick = (hospital) => {
    if (selectedHospital && selectedHospital.id === hospital.id) {
      onSelectHospital(null); // Deselect if already selected
    } else {
      onSelectHospital(hospital);
    }
  };
  return (
    <ul className="results-list">
      {hospitals.map(hospital => (
        <li
          className={`result-item${selectedHospital && selectedHospital.id === hospital.id ? ' selected-hospital' : ''}`}
          key={hospital.id}
          onClick={() => handleItemClick(hospital)}
          style={{ cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <span className="result-name">{hospital.name}</span>
            <span style={{ fontSize: '0.8rem', color: '#2ecc71', fontWeight: 'bold' }}>~2.5 km</span>
          </div>
          <p className="result-address">{hospital.address}</p>
          <p style={{ fontSize: '0.85rem', color: '#7f8c8d', marginTop: '0.5rem' }}>
            <strong>Facilities:</strong> Emergency Care, ICU, Pharmacy, 24/7 Open
          </p>
        </li>
      ))}
    </ul>
  );
};

const Navbar = ({ isLoggedIn, user, onOpenLogin, onOpenSignup, onLogout }) => (
  <header className="app-header">
    <div className="brand">
      <span>🏥</span> Hospital Locations
    </div>
    <div className="nav-buttons">
      {isLoggedIn ? (
        <>
          <span className="user-greeting">Hi, {user.email.split('@')[0]}</span>
          <button className="btn btn-outline" onClick={onLogout}>Logout</button>
        </>
      ) : (
        <>
          <button className="btn btn-outline" onClick={onOpenLogin}>Login</button>
          <button className="btn btn-primary" onClick={onOpenSignup}>Sign Up</button>
        </>
      )}
    </div>
  </header>
);

const App = () => {
  const [userAddress, setUserAddress] = useState("");
  const [coordinates, setCoordinates] = useState({ latitude: "43.793607699999995", longitude: "-79.3284823" });
  const [isAddressVisible, setAddressVisibility] = useState(false);

  // Shared selected hospital state for sidebar and map
  const [selectedHospital, setSelectedHospital] = useState(null);

  // Auth State
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('hospital_users');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('hospital_currentUser');
    return saved ? JSON.parse(saved) : null;
  });

  const [view, setView] = useState(() => {
    return localStorage.getItem('hospital_currentUser') ? 'map' : 'login';
  });
  // Hospital data state
  const [hospitals, setHospitals] = useState([]);
  const [visibleHospitals, setVisibleHospitals] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAddressVisible) {
      getUserAddress();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coordinates, isAddressVisible]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('hospital_currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('hospital_currentUser');
    }
  }, [currentUser]);

  const getLocation = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setCoordinates({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setAddressVisibility(true);
      }, (error) => {
        handleLocationError(error);
      });
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  }

  const getUserAddress = async () => {
    try {
      const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${coordinates.latitude},${coordinates.longitude}&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`);
      const data = await response.json();
      if (data.results && data.results[0]) {
        setUserAddress(data.results[0].formatted_address);
      }
    } catch (error) {
      console.error("Error fetching address:", error);
    }
  }

  const handleLocationError = (error) => {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        alert("User denied the request for Geolocation.")
        break;
      case error.POSITION_UNAVAILABLE:
        alert("Location information is unavailable.")
        break;
      case error.TIMEOUT:
        alert("The request to get user location timed out.")
        break;
      case error.UNKNOWN_ERROR:
        alert("An unknown error occurred.")
        break;
      default:
        alert("An unknown error occurred.")
    }
  }

  const handleLogin = (email, password) => {
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      setCurrentUser(user);
      setView('map');
    } else {
      alert("Invalid email or password!");
    }
  };

  const handleSignup = (name, email, password) => {
    if (users.some(u => u.email === email)) {
      alert("User with this email already exists!");
      return;
    }

    const newUser = { name, email, password };
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('hospital_users', JSON.stringify(updatedUsers));

    setCurrentUser(newUser);
    setView('map');
    alert("Account created successfully!");
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView('login');
  };

  const handleBoundsChange = React.useCallback(async (bounds) => {
    setLoading(true);
    try {
      const fetchedData = await fetchHospitalsFromOverpass(bounds);

      if (fetchedData && fetchedData.length > 0) {
        setHospitals(fetchedData);
        setVisibleHospitals(fetchedData);
      } else if (fetchedData !== null) {
        setHospitals([]);
        setVisibleHospitals([]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);




  // Mock Data (Fallback)
  const MOCK_HOSPITALS = [
    { id: 1, name: "North York General Hospital", address: "4001 Leslie St, North York", lat: 43.769, lng: -79.363 },
    { id: 2, name: "Markham Stouffville Hospital", address: "381 Church St, Markham", lat: 43.878, lng: -79.261 },
    { id: 3, name: "Sunnybrook Hospital", address: "2075 Bayview Ave, Toronto", lat: 43.722, lng: -79.375 },
    { id: 4, name: "Scarborough General Hospital", address: "3050 Lawrence Ave E, Scarborough", lat: 43.759, lng: -79.250 }
  ];

  // const App = () => {
  //   // ...

  //   const [hospitals, setHospitals] = useState(MOCK_HOSPITALS);
  //   const [visibleHospitals, setVisibleHospitals] = useState(MOCK_HOSPITALS);
  //   const [loading, setLoading] = useState(false);

  //   const handleBoundsChange = React.useCallback(async (bounds) => {
  //     setLoading(true);
  //     try {
  //       const fetchedData = await fetchHospitalsFromOverpass(bounds);

  //       if (fetchedData && fetchedData.length > 0) {
  //         setHospitals(fetchedData);
  //         setVisibleHospitals(fetchedData);
  //       } else {
  //         // Keep existing data or handle empty
  //         if (fetchedData !== null) {
  //           setHospitals([]);
  //           setVisibleHospitals([]);
  //         }
  //       }
  //     } catch (e) {
  //       console.error(e);
  //     } finally {
  //       setLoading(false);
  //     }
  //   }, []);

  if (view === 'login') {
    return <LoginPage onLogin={handleLogin} onSwitchToSignup={() => setView('signup')} />;
  }

  if (view === 'signup') {
    return <SignupPage onSignup={handleSignup} onSwitchToLogin={() => setView('login')} />;
  }


  return (
    <div className="app-container">
      <Navbar
        isLoggedIn={!!currentUser}
        user={currentUser}
        onOpenLogin={() => { }}
        onOpenSignup={() => { }}
        onLogout={handleLogout}
      />

      <main className="main-content">
        <section className="hero-section">
          <h1>Find the Nearest Hospital</h1>
          <p className="subtitle">Locate the best medical care facilities near you instantly.</p>

          <button className="btn btn-locate" onClick={getLocation}>
            📍 Locate Me
          </button>

          {isAddressVisible && (
            <div style={{ marginTop: '1.5rem' }}>
              <div className="coordinates-info">
                <p>Latitude: {coordinates.latitude}</p>
                <p>Longitude: {coordinates.longitude}</p>
                {userAddress && <p>Address: {userAddress}</p>}
              </div>
            </div>
          )}
        </section>

        {isAddressVisible && (
          <div className="content-grid">
            <div className="card">
              <h3>Map View</h3>
              <div className="map-container" style={{ position: 'relative' }}>
                {/* Overlay for catching background clicks to clear selection */}
                <div
                  style={{ position: 'absolute', inset: 0, zIndex: 2, background: 'transparent' }}
                  onClick={() => setSelectedHospital(null)}
                />
                <HospitalMap
                  hospitals={visibleHospitals}
                  center={[coordinates.latitude, coordinates.longitude]}
                  onBoundsChange={handleBoundsChange}
                  selectedHospital={selectedHospital}
                  onSelectHospital={(hospital) => {
                    // Toggle selection if same hospital is clicked
                    if (selectedHospital && hospital && selectedHospital.id === hospital.id) {
                      setSelectedHospital(null);
                    } else {
                      setSelectedHospital(hospital);
                    }
                  }}
                  userLocation={[coordinates.latitude, coordinates.longitude]}
                />
              </div>
            </div>

            <div className="card">
              <h3>Recommended Locations ({visibleHospitals.length})</h3>
              <HospitalList
                hospitals={visibleHospitals}
                selectedHospital={selectedHospital}
                onSelectHospital={setSelectedHospital}
              />
            </div>
          </div>
        )}
      </main>

      {/* Modals Removed - Handled by Pages */}

    </div>
  );
}

export default App;