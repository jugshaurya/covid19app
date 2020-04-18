# :octocat: Covid19 App - Microsoft Bing Covid19 Visualizer 🌍

[visit](https://covid19shau.now.sh/)

<img src="https://img.shields.io/badge/made%20with-react-cyan.svg" alt="made with react"> <img src="https://img.shields.io/badge/made%20with-scss-pink.svg" alt="made with scss"> <img src="https://img.shields.io/badge/made%20with-mapbox-red.svg" alt="made with mapbox">
<img src="https://img.shields.io/badge/made%20with-geojson-violet.svg" alt="made with geojson"> <img src="https://img.shields.io/badge/made%20with-express-yellow.svg" alt="made with express"> <img src="https://img.shields.io/github/last-commit/jugshaurya/covid19app" alt="last-commit"> <img src="https://img.shields.io/github/languages/code-size/jugshaurya/covid19app" alt="code-size">

### Peek a boo!😍

![](app.gif)
![](app2.gif)

### Steps:-

- [x] **0.** What we are making - https://bing.com/covid
- [x] **1.** Fetch the json data using from https://bing.com/covid/data
  - [x] get countrywise,statewise,citywise data
  - [x] and corresponding geojson data using **geojson** library
- [x] **2.** Setup map and display it on the screen. ([Use Mapbox GL JS in a React app](https://docs.mapbox.com/help/tutorials/use-mapbox-gl-js-with-react/?utm_medium=sem&utm_source=google&utm_campaign=sem|google|brand|chko-googlesearch-pr01-dynamicsearchcampaign-nb.broad-all-landingpage-search&utm_term=brand&utm_content=chko-googlesearch-pr01-dynamicsearchcampaign-nb.broad-all-landingpage-search&gclid=Cj0KCQjwm9D0BRCMARIsAIfvfIbbxayVpjs6UK_am7YHfNIfbZdVXUZPrdVhnMXJsn9MY3FUHG7MgwMaAnGUEALw_wcB)
      )

  - [x] Get a reference to map container
  - [x] create map using new new mapboxgl.Map()
  - [x] add styles(mapbox://styles/mapbox/streets-v11)
  - [x] add default lat,long,zoom - used indias(lat: "22.4034", lng: "80.6", zoom: "3.2")
  - [x] Add map Controllers for zoomin zoom out and geolocation as well -[x] map move listeners

- [x] **3.** [Jump in Map](https://docs.mapbox.com/mapbox-gl-js/example/jump-to/) Render cities on left panel and add onclick listener to jump to that country in map.

- [x] **4.** Add layers on map load, popup on map load, toggle layers.
  - [x] [Toggle Layers](https://docs.mapbox.com/mapbox-gl-js/example/toggle-layers/)
  - [x] [Mapbox-popup](https://docs.mapbox.com/mapbox-gl-js/example/popup-on-hover/)

### Resource-

- [Mapbox-gl](https://docs.mapbox.com/help/how-mapbox-works/web-apps)

### What you need

- A text editor. Use the text editor of your choice for writing HTML, CSS, and JavaScript.
- A Mapbox access token. Your Mapbox access tokens are on your Account page.
- Node.js and npm. To run the commands necessary to run your React app locally, install Node.js and npm.
- Working familiarity with React.
- Mapbox GL JS. Mapbox GL JS is a JavaScript library used for building web maps.

### Wanna Contribute

```
git clone ${url}
cd server && npm start - to run server
yarn start - to run frontend
make changes
send PRs
Get them merge into the codebase✌✌✌
```

### server and frontend on now.sh

```
https://covid19shau.now.sh/
https://covid19-server-iota.now.sh/
```
