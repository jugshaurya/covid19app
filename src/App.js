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
          // pushing the states data in the citiesData if no cities data found for a state like china!
          if (cities.length === 0) return acc.push(state);
          // otherwise adding cities data
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

    this.map = map;

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
    const sources = [
      {
        data: this.state.countries_geo_json,
        source: "countries_points",
        id: "countries_circles",
        stops: [0, 1, 1000, 10, 25000, 20, 50000, 30, 100000, 40],
        color: "#0000FF",
        visibility: "none",
      },
      {
        data: this.state.states_geo_json,
        source: "states_points",
        id: "states_circles",
        stops: [1000, 8, 25000, 10, 50000, 13, 100000, 15],
        color: "#00FF00",
        visibility: "none",
      },
      {
        data: this.state.cities_geo_json,
        source: "cities_points",
        id: "cities_circles",
        stops: [0, 5, 100, 8, 500, 12, 1000, 16, 2000, 18, 5000, 22],
        color: "#FF0000",
        visibility: "visible",
      },
    ];

    // add on load Listeners for every source
    map.on("load", () => {
      sources.map((source) => {
        map.addSource(source.source, {
          type: "geojson",
          data: source.data,
        });
        return map.addLayer({
          id: source.id,
          source: source.source, // this should be the id of the source
          type: "circle",
          layout: {
            visibility: source.visibility,
          },
          // paint properties
          paint: {
            "circle-stroke-width": 1,
            "circle-opacity": 0.5,
            "circle-radius": [
              "interpolate",
              ["linear"],
              ["get", "totalConfirmed"],
              ...source.stops,
            ],
            "circle-color": source.color,
          },
        });
      });
    });
  };

  handleSpecificCountry = (e, countryId) => {
    const { dataset } = this.state;
    const countries = dataset.areas;
    const requiredCountry = countries.find(
      (country) => country.id === countryId
    );
    // show a layer for each city in requiredCountry
    console.log(requiredCountry);
    this.map.jumpTo({ center: [requiredCountry.long, requiredCountry.lat] });
    this.setState({
      lat: requiredCountry.lat.toFixed(4),
      lng: requiredCountry.long.toFixed(4),
    });
  };

  renderCountryLists = () => {
    const { countryWiseData } = this.state;
    return (
      countryWiseData &&
      countryWiseData.map((country) => (
        <li
          className="country"
          key={country.id}
          onClick={(e) => this.handleSpecificCountry(e, country.id)}
        >
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

  handleLayerChange = (e, id) => {
    e.preventDefault();
    // e.stopPropagation();

    const visibility = this.map.getLayoutProperty(id, "visibility");
    if (visibility === "visible") {
      this.map.setLayoutProperty(id, "visibility", "none");
    } else {
      this.map.setLayoutProperty(id, "visibility", "visible");
    }
  };
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
            <div className="ChangeLayer">
              <button
                onClick={(e) => this.handleLayerChange(e, "cities_circles")}
              >
                Red: {"city-wise"}
              </button>
              <button
                onClick={(e) => this.handleLayerChange(e, "states_circles")}
              >
                Blue: {"state-wise"}
              </button>
              <button
                onClick={(e) => this.handleLayerChange(e, "countries_circles")}
              >
                Green: {"Country-wise"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
