import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
// import dataJawaTimur from './dataJson/dataJawaTimur.json'
// import dataJatim from './dataJson/jawa-timur.geojson'
import dataKabupaten from './dataJson/kabupaten.geojson' 
import dataDownload from './dataJson/data-download.json'
mapboxgl.accessToken = 'pk.eyJ1Ijoia2FzaGlraTIyNTEyMSIsImEiOiJja3QzcThmMTUwa2J3MzJudDdnaDVpeG5mIn0.MiGBhPWKUsgW4Y7gbw4pQA';

function getData(kabupaten){
  return dataDownload.filter(item => item.location === kabupaten);
}

function getDataColor(){
  let data = [];
  data.push('match');
  data.push(['get','KABUPATEN']);
  dataDownload.map((e) => {
    data.push(e.location);
    if(e.avg_download_throughput > 15000){
      data.push('#B71C1C');
    }else if(e.avg_download_throughput > 10000 && e.avg_download_throughput <= 15000){
      data.push('#EF5350');
    }else if(e.avg_download_throughput > 0 && e.avg_download_throughput <= 10000){
      data.push('#FFEBEE');
    }else{
      data.push('yellow');
    }
    return true;
  })
  data.push('white');  
  return data;
}

function getDataPersen(average){
  let total = 0;
  dataDownload.map((e) => { 
    total += e.avg_download_throughput
  })
  return average/total * 100;
}


export default function App() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(112.616);
  const [lat, setLat] = useState(-7.88129);
  const [zoom, setZoom] = useState(7.65);
  
  useEffect(() => {
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [lng, lat],
      zoom: zoom
    });
  });
  
  useEffect(() => {
    if (!map.current) return; // wait for map to initialize
    map.current.on('move', () => {
      setLng(map.current.getCenter().lng.toFixed(4));
      setLat(map.current.getCenter().lat.toFixed(4));
      setZoom(map.current.getZoom().toFixed(2));
    });
  });
  
  useEffect(() => {
    if (!map.current) return; // wait for map to initialize
    map.current.on('load', () => {
      // Add a data source containing GeoJSON data.
      map.current.addSource('kabupaten', {
        'type': 'geojson',
        'data': dataKabupaten
      });
      
      // Add a new layer to visualize the polygon.
      map.current.addLayer({
        'id': 'kabupaten',
        'type': 'fill',
        'source': 'kabupaten', // reference the data source
        'layout': {},
        'paint': {
          'fill-color': getDataColor()
        }
      });

      // Add a new layer to visualize the polygon.
      // map.current.addLayer({
      //   'id': 'label',
      //   'type': 'symbol',
      //   'source': 'kabupaten', // reference the data source
      //   'layout': {
      //     'text-field':['get', 'KABUPATEN']
      //   }
      // });

      map.current.addLayer({
        'id': 'state-borders',
        'type': 'line',
        'source': 'kabupaten',
        'layout': {},
        'paint': {
          'line-color': '#000',
          'line-width': 0.1
        }
      });
      
      // Create a popup, but don't add it to the map yet.
      const popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
        maxWidth: '900px'
      });
      
      map.current.on('mousemove', 'kabupaten', (e) => {
        // Change the cursor style as a UI indicator.
        map.current.getCanvas().style.cursor = 'pointer';
        const kabupaten = e.features[0].properties.KABUPATEN
        const data = getData(kabupaten);
        // Copy coordinates array.
        const description = `
          <p>Region</p>
          <b>${data[0].region}</b>
          <p>Kabupaten</p>
          <b>${data[0].location}</b>
          <p>Average Download</p>
          <b>${data[0].avg_download_throughput.toFixed(2)} (${getDataPersen(data[0].avg_download_throughput).toFixed(2)}%)</b>`;
        
        // Ensure that if the map is zoomed out such that multiple
        // copies of the feature are visible, the popup appears
        // over the copy being pointed to.
        
        
        // Populate the popup and set its coordinates
        // based on the feature found.
        popup.setLngLat(e.lngLat).setHTML(description).addTo(map.current);
      });
      
      map.current.on('mouseleave', 'kabupaten', () => {
        map.current.getCanvas().style.cursor = '';
        popup.remove();
      });
      
      // Add a data source containing GeoJSON data.
      // map.current.addSource('jatim', {
      //   'type': 'geojson',
      //   'data': dataJatim
      // });
      
      // // Add a new layer to visualize the polygon.
      // map.current.addLayer({
      //   'id': 'jatim',
      //   'type': 'fill',
      //   'source': 'jatim', // reference the data source
      //   'layout': {},
      //   'paint': {
      //     'fill-color': "#ff7300", 
      //     'fill-opacity': 0.2
      //   }
      // });
      
      // dataJawaTimur.data.map(item => {
      //   // Add a data source containing GeoJSON data.
      //   map.current.addSource(item.name, {
      //     'type': 'geojson',
      //     'data': {
      //       'type': 'Feature',
      //       'geometry': {
      //         'type': item.type,
      //         // These coordinates outline.
      //         'coordinates': item.data,
      //       },
      //       'properties' : {
      //         'name' : item.name
      //       }
      //     }
      //   });
      
      //   // Add a new layer to visualize the polygon.
      //   map.current.addLayer({
      //     'id': item.name,
      //     'type': 'fill',
      //     'source': item.name, // reference the data source
      //     'layout': {},
      //     'paint': {
      //       'fill-color': item.color, 
      //       'fill-opacity': 0.5,
      //       'fill-outline-color': '#000'
      //     }
      //   });
      
      //   map.current.on('click', item.name, (e) => {
      //     new mapboxgl.Popup()
      //     .setLngLat(e.lngLat)
      //     .setHTML(e.features[0].properties.name)
      //     .addTo(map.current);
      //     });
      
      //     // Change the cursor to a pointer when
      //     // the mouse is over the states layer.
      //     map.current.on('mouseenter', item.name, () => {
      //     map.current.getCanvas().style.cursor = 'pointer';
      //     });
      
      //     // Change the cursor back to a pointer
      //     // when it leaves the states layer.
      //     map.current.on('mouseleave', item.name, () => {
      //     map.current.getCanvas().style.cursor = '';
      //     });
      // })
    });
  });
  
  return (
    <div>
    <div className="sidebar">
    Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
    </div>
    <div ref={mapContainer} className="map-container" />
    </div>
    );
  }