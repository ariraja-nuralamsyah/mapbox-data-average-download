import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import dataJawaTimur from './dataJson/dataJawaTimur.json'
import dataJatim from './dataJson/jawa-timur.geojson'
mapboxgl.accessToken = 'pk.eyJ1Ijoia2FzaGlraTIyNTEyMSIsImEiOiJja3QzcThmMTUwa2J3MzJudDdnaDVpeG5mIn0.MiGBhPWKUsgW4Y7gbw4pQA';

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

      dataJawaTimur.data.map(item => {
        // Add a data source containing GeoJSON data.
        map.current.addSource(item.name, {
          'type': 'geojson',
          'data': {
            'type': 'Feature',
            'geometry': {
              'type': item.type,
              // These coordinates outline.
              'coordinates': item.data,
            },
            'properties' : {
              'name' : item.name
            }
          }
        });
        
        // Add a new layer to visualize the polygon.
        map.current.addLayer({
          'id': item.name,
          'type': 'fill',
          'source': item.name, // reference the data source
          'layout': {},
          'paint': {
            'fill-color': item.color, 
            'fill-opacity': 0.5,
            'fill-outline-color': '#000'
          }
        });

        map.current.on('click', item.name, (e) => {
          new mapboxgl.Popup()
          .setLngLat(e.lngLat)
          .setHTML(e.features[0].properties.name)
          .addTo(map.current);
          });
           
          // Change the cursor to a pointer when
          // the mouse is over the states layer.
          map.current.on('mouseenter', item.name, () => {
          map.current.getCanvas().style.cursor = 'pointer';
          });
           
          // Change the cursor back to a pointer
          // when it leaves the states layer.
          map.current.on('mouseleave', item.name, () => {
          map.current.getCanvas().style.cursor = '';
          });
      })
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