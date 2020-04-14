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
    zoom: "2",
    covidData: {
      countries_geo_json: [],
    },
  };

  mapboxElRef = React.createRef();

  componentDidMount() {
    const { lat, lng, zoom } = this.state;
    const map = new mapboxgl.Map({
      container: this.mapboxElRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [lng, lat],
      zoom,
    });

    // map move listener
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
    this.fetchDataAndAddSource(map);
  }

  fetchDataAndAddSource = async (map) => {
    const response = await fetch("http://localhost:8088/api/v1/data");
    const data = await response.json();
    console.log(data);

    // map.addLayer({
    //   id: "points",
    //   type: "symbol",
    //   source: "points",
    //   layout: {
    //     // get the icon name from the source's "icon" property
    //     // concatenate the name to get an icon from the style's sprite sheet
    //     "icon-image": ["concat", ["get", "icon"], "-15"],
    //     // get the title name from the source's "title" property
    //     "text-field": ["get", "title"],
    //     "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
    //     "text-offset": [0, 0.6],
    //     "text-anchor": "top",
    //   },
    // });
    // const countries = data.areas.reduce((acc, country) => {

    //   // Level1 has countries data
    //   const countryObject = {...country}
    //   delete country.areas;
    //   acc.Level1 = [...acc.Level1, countryObject];

    //   const states = country.areas;
    //   if (states.length != 0){
    //     states.map(state => )
    //   }
    //   return acc;
    // }, []);

    // console.log(countries);

    this.setState(
      {
        covidData: {
          totalConfirmed: data.totalConfirmed,
          totalConfirmedDelta: data.totalConfirmedDelta,
          totalDeaths: data.totalDeaths,
          totalDeathsDelta: data.totalDeathsDelta,
          totalRecovered: data.totalRecovered,
          totalRecoveredDelta: data.totalRecoveredDelta,
          lastUpdated: data.lastUpdated,
          countries: data.areas,
          countries_geo_json: geojson.parse(data.areas, {
            Point: ["lat", "long"],
          }),
        },
      },
      () => {
        map.on("load", () => {
          map.addSource("points", {
            type: "geojson",
            data: this.state.covidData.countries_geo_json,
          });
        });
      }
    );
  };

  render() {
    const { lng, lat, zoom } = this.state;
    return (
      <div className="App">
        <div className="left">
          <ul></ul>
        </div>
        <div className="right">
          <div className="long-and-lat-and-zoom">
            <div>
              Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
            </div>
          </div>
          <div className="mymap" ref={this.mapboxElRef} />
        </div>
      </div>
    );
  }
}

export default App;
