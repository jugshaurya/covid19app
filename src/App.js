import React from "react";
import mapboxgl from "mapbox-gl";
import mapbox_token_key from "./config";
import geojson from "geojson";

// needed for the map-contollers
import "mapbox-gl/dist/mapbox-gl.css";
import "./App.scss";

mapboxgl.accessToken = mapbox_token_key;
class App extends React.Component {
  state = {
    lat: "22.4034",
    lng: "80.6",
    zoom: "3.2",
    dataset: [],
    layer: 2, // options are 0 ,1 ,2
  };

  mapboxElRef = React.createRef();

  fetchData = async () => {
    try {
      const response = await fetch("http://localhost:8088/api/v1/data");
      const dataset = await response.json();
      const countries = dataset.areas;

      // which country have what cases: deaths, confirmed, recovered
      const countryWiseData = countries.reduce((acc, country) => {
        const withoutAreas = { ...country };
        delete withoutAreas.areas;
        if (country.areas.length !== 0) {
          acc.push(withoutAreas);
        }
        return acc;
      }, []);

      // countries' States Data
      const stateWiseData = countries.reduce((acc, country) => {
        const states = country.areas;
        if (states.length !== 0) {
          states.map((state) => acc.push(state));
        }
        return acc;
      }, []);

      // States' citywise data
      const cityWiseData = countries.reduce((acc, country) => {
        const states = country.areas;
        states.map((state) => {
          const cities = state.areas;
          return cities.map((city) => acc.push(city));
        });
        return acc;
      }, []);

      this.setState({
        dataset,
        countryWiseData,
        stateWiseData,
        cityWiseData,
        countries_geo_json: geojson.parse(countryWiseData, {
          Point: ["lat", "long"],
        }),

        states_geo_json: geojson.parse(stateWiseData, {
          Point: ["lat", "long"],
        }),

        cities_geo_json: geojson.parse(cityWiseData, {
          Point: ["lat", "long"],
        }),
      });
    } catch (err) {
      console.err(err);
    }
  };

  async componentDidMount() {
    const { lat, lng, zoom } = this.state;
    const map = new mapboxgl.Map({
      container: this.mapboxElRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [lng, lat],
      zoom,
    });

    // map move listener to update the lat, long, zoom of map
    map.on("move", () => {
      this.setState({
        lng: map.getCenter().lng.toFixed(4),
        lat: map.getCenter().lat.toFixed(4),
        zoom: map.getZoom().toFixed(2),
      });
    });

    // controllers on screen for client
    map.addControl(new mapboxgl.NavigationControl());

    // fetching data for covid19
    await this.fetchData();

    this.addMapLayers(map);

    //  Add geolocate control to the map to let user knew his/her location.
    map.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: true,
      })
    );
  }

  addMapLayers = (map) => {
    // add on load Lisetners
    map.on("load", () => {
      map.addSource("countries_points", {
        type: "geojson",
        data: this.state.countries_geo_json,
      });
      map.addLayer({
        id: "countries_circles",
        source: "countries_points", // this should be the id of the source
        type: "circle",
        // paint properties
        paint: {
          "circle-stroke-width": 1,
          "circle-opacity": 0.5,
          "circle-radius": [
            "interpolate",
            ["linear"],
            ["get", "totalConfirmed"],
            0,
            1,
            1000,
            10,
            25000,
            20,
            50000,
            30,
            100000,
            40,
          ],
          "circle-color": "#FF0000",
        },
      });

      map.addSource("states_points", {
        type: "geojson",
        data: this.state.states_geo_json,
      });

      map.addLayer({
        id: "states_circles",
        source: "states_points", // this should be the id of the source
        type: "circle",
        // paint properties
        paint: {
          "circle-stroke-width": 1,
          "circle-opacity": 0.5,
          "circle-radius": [
            "interpolate",
            ["linear"],
            ["get", "totalConfirmed"],
            1000,
            10,
            25000,
            20,
            50000,
            25,
            100000,
            40,
          ],
          "circle-color": "#00FF00",
        },
      });

      map.addSource("cities_points", {
        type: "geojson",
        data: this.state.cities_geo_json,
      });
      map.addLayer({
        id: "cities_circles",
        source: "cities_points", // this should be the id of the source
        type: "circle",
        // paint properties
        paint: {
          "circle-stroke-width": 1,
          "circle-opacity": 0.5,
          "circle-radius": [
            "interpolate",
            ["linear"],
            ["get", "totalConfirmed"],
            0,
            5,
            1000,
            10,
            25000,
            15,
            50000,
            20,
          ],
          "circle-color": "#0000FF",
        },
      });
    });
  };

  renderCountryLists = () => {
    const { countryWiseData } = this.state;
    return (
      countryWiseData &&
      countryWiseData.map((country) => (
        <li className="country" key={country.id}>
          <div className="name">{country.displayName}</div>
          <div className="stats">
            <div className="death" style={{ color: "red" }}>
              {country.totalDeaths}
            </div>
            <div className="recovered" style={{ color: "green" }}>
              {country.totalRecovered}
            </div>
          </div>
        </li>
      ))
    );
  };

  //  displayName
  // "New York City"
  // id
  // "newyorkcity_newyork_unitedstates"
  // lastUpdated
  // "2020-04-16T06:56:53.248Z"
  // lat
  // 40.71455001831055
  // long
  // -74.00714111328125
  // parentId
  // "newyork_unitedstates"
  // totalConfirmed
  // 118302
  // totalConfirmedDelta
  // 7877
  // totalDeaths
  // 10899
  // totalDeathsDelta
  // 2994
  // totalRecovered
  // 18018
  // totalRecoveredDelta

  render() {
    const { lng, lat, zoom } = this.state;
    // this.map && this.addLayers();
    return (
      <div className="App">
        <div className="left">
          <ul>
            <li className="template country">
              <div className="name">Country</div>
              <div className="stats">
                <div className="death" style={{ color: "red" }}>
                  Deaths
                </div>
                <div className="recovered" style={{ color: "green" }}>
                  Recovered
                </div>
              </div>
            </li>

            {this.renderCountryLists()}
          </ul>
        </div>
        <div className="right">
          <div className="long-and-lat-and-zoom">
            <div>
              Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
            </div>
          </div>
          <div className="mymap" ref={this.mapboxElRef} />
          <div className="color-info">
            <div>
              Red: {"Country-wise"} | Green: {"State-wise"} | Blue:{" "}
              {"cities-wise"}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
