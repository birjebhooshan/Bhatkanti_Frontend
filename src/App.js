import './App.css';
import * as React from 'react';
import { useEffect, useState } from "react";
import Map, {Marker, Popup} from 'react-map-gl';
import maplibregl from 'maplibre-gl';
import "mapbox-gl/dist/mapbox-gl.css";
import LocationOnIcon from '@mui/icons-material/LocationOn';
import StarIcon from '@mui/icons-material/Star';
import axios from "axios";
import { format } from "timeago.js";
import Register from "./components/Register";
import Login from "./components/Login";

export default function App() {
  const myStorage = window.localStorage;
  const [currentUsername, setCurrentUsername] = useState(myStorage.getItem("user"));
  const [pins, setPins] = useState([]);
  const [currentPlaceId, setCurrentPlaceId] = useState(null);
  const [newPlace, setNewPlace] = useState(null);
  const [title, setTitle] = useState(null);
  const [desc, setDesc] = useState(null);
  const [star, setStar] = useState(0);
  const [viewState, setViewState] = useState({
    longitude: 79.088860,
    latitude:  21.146633,
    zoom: 3.5
  });

  const [showRegister, setShowRegister] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const handleMarkerClick = (id, lat, long) => {
    setCurrentPlaceId(id);
    setViewState({ ...viewState, latitude: lat, longitude: long });
  };

  const handleAddClick = (e) => {
    const coord = e['lngLat'];
    setNewPlace({
      long: coord['lng'],
      lat: coord['lat']
    })
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newPin = {
      username: currentUsername,
      title,
      desc,
      rating: star,
      lat: newPlace.lat,
      long: newPlace.long,
    };

    try {
      console.log(newPin);
      const res = await axios.post("/pins", newPin);
      setPins([...pins, res.data]);
      setNewPlace(null);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const getPins = async () => {
      try {
        const allPins = await axios.get("/pins");
        setPins(allPins.data);
      } catch (err) {
        console.log(err);
      }
    };
    getPins();
  }, []);

  const handleLogout = () => {
    setCurrentUsername(null);
    myStorage.removeItem("user");
  };

  return(
    <div style={{ height: "100vh", width: "100%" }}>
    <Map mapLib={maplibregl}
    {...viewState}
    onMove={evt => setViewState(evt.viewState)}
    style={{width: '100vw', height: '100vh'}}
    mapStyle= {`https://api.maptiler.com/maps/streets-v2/style.json?key=cRn1XJG9WHpkdeopCXTg`}
    transitionDuration="200"
    onDblClick={currentUsername && handleAddClick}
    >
    {pins.map((p) => (
      <>
      <Marker
      latitude={p.lat}
      longitude={p.long}
      offsetLeft={-3.5 * viewState.zoom}
      offsetTop={-7 * viewState.zoom}
      >
      <LocationOnIcon
      style={{
        fontSize: 7 * viewState.zoom,
        color:
        currentUsername === p.username ? "tomato" : "slateblue",
        cursor: "pointer",
      }}
      onClick={() => handleMarkerClick(p._id, p.lat, p.long)}
      />
      </Marker>
      {p._id === currentPlaceId && (
    <Popup
    key={p._id}
    latitude={p.lat}
    longitude={p.long}
    closeButton={true}
    closeOnClick={false}
    onClose={() => setCurrentPlaceId(null)}
    anchor="left"
    >
    <div className="card">
    <label>Place</label>
    <h4 className="place">{p.title}</h4>
    <label>Review</label>
    <p className="desc">{p.desc}</p>
    <label>Rating</label>
    <div className="stars">
    {Array(p.rating).fill(<StarIcon className="star" />)}
    </div>
    <label>Information</label>
    <span className="username">
    Created by <b>{p.username}</b>
    </span>
    <span className="date">{format(p.createdAt)}</span>
    </div>
    </Popup>
    )}
    </>
    ))}

    {newPlace && (
      <>
      <Marker
      latitude={newPlace.lat}
      longitude={newPlace.long}
      offsetLeft={-3.5 * viewState.zoom}
      offsetTop={-7 * viewState.zoom}
      >
      <LocationOnIcon
      style={{
        fontSize: 7 * viewState.zoom,
        color: "tomato",
        cursor: "pointer",
      }}
      />
      </Marker>
      <Popup
      latitude={newPlace.lat}
      longitude={newPlace.long}
      closeButton={true}
      closeOnClick={false}
      onClose={() => setNewPlace(null)}
      anchor="left"
      >
      <div>
      <form onSubmit={handleSubmit}>
      <label>Title</label>
      <input
      placeholder="Enter a title"
      autoFocus
      onChange={(e) => setTitle(e.target.value)}
      />
      <label>Description</label>
      <textarea
      placeholder="Say us something about this place."
      onChange={(e) => setDesc(e.target.value)}
      />
      <label>Rating</label>
      <select onChange={(e) => setStar(e.target.value)}>
      <option value="1">1</option>
      <option value="2">2</option>
      <option value="3">3</option>
      <option value="4">4</option>
      <option value="5">5</option>
      </select>
      <button type="submit" className="submitButton">
      Add Pin
      </button>
      </form>
      </div>
      </Popup>
      </>
      )}
      {currentUsername ? (
        <button className="button logout" onClick={handleLogout}>
        Log out
        </button>
        ) : (
          <div className="buttons">
          <button className="button login" onClick={() => setShowLogin(true)}>
          Log in
          </button>
          <button
          className="button register"
          onClick={() => setShowRegister(true)}
          >
          Register
          </button>
          </div>
          )}
          {showRegister && <Register setShowRegister={setShowRegister} />}
          {showLogin && (
            <Login
            setShowLogin={setShowLogin}
            setCurrentUsername={setCurrentUsername}
            myStorage={myStorage}
            />
            )}
            </Map>
            </div>
            );
          }