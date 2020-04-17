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
  };

  mapboxElRef = React.createRef();

  fetchData = async () => {
    try {
      const response = await fetch(
        "https://covid19-server-iota.now.sh/api/v1/data"
      );
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
    //  Add geolocate control to the map to let user knew his/her location.
    map.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: true,
      })
    );

    // fetching data for covid19
    await this.fetchData();

    this.addMapLayers(map);
  }

  addMapLayers = (map) => {
    const layerData = [
      {
        data: this.state.countries_geo_json,
        layer: "countries_points_c",
        id: "countries_circles_c",
        stops: [0, 1, 100, 2, 1000, 3, 25000, 5, 50000, 7, 100000, 9],
        color: "#0000FF",
        visibility: "none",
        property: "totalConfirmed",
      },
      {
        data: this.state.states_geo_json,
        layer: "states_points_c",
        id: "states_circles_c",
        stops: [1000, 8, 25000, 10, 50000, 13, 100000, 15],
        color: "#00FF00",
        visibility: "none",
        property: "totalConfirmed",
      },
      {
        data: this.state.cities_geo_json,
        layer: "cities_points_c",
        id: "cities_circles_c",
        stops: [0, 5, 100, 8, 500, 12, 1000, 16, 2000, 18, 5000, 22],
        color: "#FF0000",
        visibility: "visible",
        property: "totalConfirmed",
      },
      {
        data: this.state.countries_geo_json,
        layer: "countries_points_d",
        id: "countries_circles_d",
        stops: [0, 1, 1000, 10, 25000, 20, 50000, 30, 100000, 40],
        color: "#0000FF",
        visibility: "none",
        property: "totalDeaths",
      },
      {
        data: this.state.states_geo_json,
        layer: "states_points_d",
        id: "states_circles_d",
        stops: [1000, 8, 25000, 10, 50000, 13, 100000, 15],
        color: "#00FF00",
        visibility: "none",
        property: "totalDeaths",
      },
      {
        data: this.state.cities_geo_json,
        layer: "cities_points_d",
        id: "cities_circles_d",
        stops: [0, 5, 100, 8, 500, 12, 1000, 16, 2000, 18, 5000, 22],
        color: "#FF0000",
        visibility: "none",
        property: "totalDeaths",
      },
      {
        data: this.state.countries_geo_json,
        layer: "countries_points_r",
        id: "countries_circles_r",
        stops: [0, 1, 1000, 10, 25000, 20, 50000, 30, 100000, 40],
        color: "#0000FF",
        visibility: "none",
        property: "totalRecovered",
      },
      {
        data: this.state.states_geo_json,
        layer: "states_points_r",
        id: "states_circles_r",
        stops: [1000, 8, 25000, 10, 50000, 13, 100000, 15],
        color: "#00FF00",
        visibility: "none",
        property: "totalRecovered",
      },
      {
        data: this.state.cities_geo_json,
        layer: "cities_points_r",
        id: "cities_circles_r",
        stops: [0, 5, 100, 8, 500, 12, 1000, 16, 2000, 18, 5000, 22],
        color: "#FF0000",
        visibility: "none",
        property: "totalRecovered",
      },
    ];
    const popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
    });

    // add on load Listeners for every layer
    map.on("load", () => {
      layerData.map((layer) => {
        map.addSource(layer.layer, {
          type: "geojson",
          data: layer.data,
        });

        map.addLayer({
          id: layer.id,
          source: layer.layer, // this should be the id of the layer
          type: "circle",
          layout: {
            visibility: layer.visibility,
          },
          // paint properties
          paint: {
            "circle-stroke-width": 1,
            "circle-opacity": 0.5,
            "circle-radius": [
              "interpolate",
              ["linear"],
              ["get", layer.property],
              ...layer.stops,
            ],
            "circle-color": layer.color,
          },
        });

        map.on("mousemove", layer.id, (e) => {
          const coordinates = e.features[0].geometry.coordinates;
          const {
            displayName,
            totalConfirmed,
            totalDeaths,
            totalRecovered,
          } = e.features[0].properties;

          popup
            .setLngLat(coordinates)
            .setHTML(
              `<div className="popup-html">
                  <p>Country: <b>${displayName}</b></p>
                  <p>TotalConfirmed: <b>${totalConfirmed}</b></p>
                  <p>Deaths: <b>${
                    totalDeaths === "null" ? 0 : totalDeaths
                  }</b></p>
                  <p>Recovered: <b>${
                    totalRecovered === "null" ? 0 : totalRecovered
                  }</b></p>
              </div>`
            )
            .addTo(map);
        });

        // Mouse leave event
        map.on("mouseleave", layer.id, function () {
          popup.remove();
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
            <div className="confirmed" style={{ color: "blue" }}>
              {country.totalConfirmed}
            </div>
            <div className="recovered" style={{ color: "green" }}>
              {country.totalRecovered}
            </div>
            <div className="death" style={{ color: "red" }}>
              {country.totalDeaths}
            </div>
          </div>
        </li>
      ))
    );
  };

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
    const { lng, lat, zoom, dataset } = this.state;
    // this.map && this.addLayers();
    return (
      <div className="App">
        <div className="left">
          <ul>
            <li className="template country">
              <div className="name">Country</div>
              <div className="stats">
                <div className="confirmed" style={{ color: "blue" }}>
                  Confirmed
                </div>
                <div className="recovered" style={{ color: "green" }}>
                  Recovered
                </div>
                <div className="death" style={{ color: "red" }}>
                  Deaths
                </div>
              </div>
            </li>
            <li className="template country">
              <div className="name">Global</div>
              <div className="stats">
                <div className="confirmed" style={{ color: "blue" }}>
                  {dataset.totalConfirmed}
                </div>
                <div className="recovered" style={{ color: "green" }}>
                  {dataset.totalRecovered}
                </div>
                <div className="death" style={{ color: "red" }}>
                  {dataset.totalDeaths}
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
              <table>
                <thead>
                  <tr>
                    <th></th>
                    <th>City-wise</th>
                    <th>State-wise</th>
                    <th>Country-wise</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="non-btn">{"Confirmed "}</td>
                    <td>
                      <button
                        onClick={(e) =>
                          this.handleLayerChange(e, "cities_circles_c")
                        }
                      >
                        Red
                      </button>
                    </td>
                    <td>
                      <button
                        onClick={(e) =>
                          this.handleLayerChange(e, "states_circles_c")
                        }
                      >
                        Green
                      </button>
                    </td>
                    <td>
                      <button
                        onClick={(e) =>
                          this.handleLayerChange(e, "countries_circles_c")
                        }
                      >
                        Blue
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td className="non-btn">{"Recovered "}</td>

                    <td>
                      <button
                        onClick={(e) =>
                          this.handleLayerChange(e, "cities_circles_r")
                        }
                      >
                        Red
                      </button>
                    </td>
                    <td>
                      <button
                        onClick={(e) =>
                          this.handleLayerChange(e, "states_circles_r")
                        }
                      >
                        Green
                      </button>
                    </td>
                    <td>
                      <button
                        onClick={(e) =>
                          this.handleLayerChange(e, "countries_circles_r")
                        }
                      >
                        Blue
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td className="non-btn">{"Deaths "}</td>
                    <td>
                      <button
                        onClick={(e) =>
                          this.handleLayerChange(e, "cities_circles_d")
                        }
                      >
                        Red
                      </button>
                    </td>
                    <td>
                      <button
                        onClick={(e) =>
                          this.handleLayerChange(e, "states_circles_d")
                        }
                      >
                        Green
                      </button>
                    </td>
                    <td>
                      <button
                        onClick={(e) =>
                          this.handleLayerChange(e, "countries_circles_d")
                        }
                      >
                        Blue
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
