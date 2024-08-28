import './App.css'
import { useGeolocated } from "react-geolocated";
import { useGetGolfCourses } from './useGetGolfCourse';
import { useEffect, useState } from 'react';
import { useGetDistance } from './useGetDistance';


function App() {

  const [radius, setRadius] = useState<number>(50000);

  const { coords, isGeolocationAvailable, isGeolocationEnabled } =
    useGeolocated({
      positionOptions: {
        enableHighAccuracy: false,
      },
      userDecisionTimeout: 5000,
    });

  const { data, isLoading } = useGetGolfCourses({ center: { latitude: coords?.latitude, longitude: coords?.longitude }, distance: radius });

  const [currentlyLoadingCourse, setCurrentlyLoadingCourse] = useState<number | null>(null);


  const [loadedCourses, setLoadedCourses] = useState<Map<number, number>>(new Map());

  const [remainingCourses, setRemainingCourses] = useState<number[]>([]);

  const { data: distancesData } = useGetDistance({
    from: { latitude: coords?.latitude, longitude: coords?.longitude },
    to: {
      latitude: data?.elements.filter(t => t.id === currentlyLoadingCourse)[0]?.tags?.lat,
      longitude: data?.elements.filter(t => t.id === currentlyLoadingCourse)[0]?.tags?.lon,
    }
  });

  useEffect(() => {
    console.log('distancesData', distancesData?.routes[0].distance);
    console.log("setting currentlyLoadingCourse", currentlyLoadingCourse);
    setLoadedCourses(previous => {
      if (currentlyLoadingCourse && distancesData?.routes[0].distance) {
        previous.set(currentlyLoadingCourse, distancesData.routes[0].distance);
        setRemainingCourses(previous => previous.filter(t => t !== currentlyLoadingCourse));
        return previous;
      } else {
        return previous;
      }
    }
    );
  }, [distancesData]);


  useEffect(() => {
    if (remainingCourses.length > 0) {
      setCurrentlyLoadingCourse(remainingCourses[0]);
    }
  }, [remainingCourses]);

  useEffect(() => {
    if (data && data.elements.length > 0) {
      setRemainingCourses(data.elements.map(t => t.id).filter(t => !loadedCourses.has(t)));
    }
  }, [data]);

  return !isGeolocationAvailable ? (
    <div>Your browser does not support Geolocation</div>
  ) : !isGeolocationEnabled ? (
    <div>Geolocation is not enabled</div>
  ) : coords ? (
    <div>
      <table>
        <tbody>
          <tr>
            <td>latitude</td>
            <td>{coords.latitude}</td>
          </tr>
          <tr>
            <td>longitude</td>
            <td>{coords.longitude}</td>
          </tr>
        </tbody>
      </table>
      <h1>Golf courses</h1>
      <label>
        Radius (km):
        <input
          type="number"
          value={radius / 1000}
          onChange={(e) => setRadius(parseInt(e.target.value) * 1000)}
        />
      </label>
      {isLoading && !!data ? (
        <div>Loading the golf courses&hellip;</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Holes</th>
              <th>Description</th>
              <th>Location</th>
              <th>Driving distance</th>
            </tr>
          </thead>
          <tbody>
            {data?.elements.map((element) => (
              <tr key={element.id}>
                <td>{element.tags.name}</td>
                <td>{element.tags.holes} holes</td>
                <td>{element.tags.description}</td>
                <td>{element.tags.lat}, {element.tags.lon}</td>
                <td>
                  {loadedCourses.has(element.id) ? (
                    <>{Math.round(loadedCourses.get(element.id)!! / 1000)} km</>
                  ) : <div>Loading&hellip;</div>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

      )}
      <footer>
        <p>Author: Jakub Havlík</p>
        <p><a href="https://github.com/jakubhavlik/golf-course-finder/">https://github.com/jakubhavlik/golf-course-finder/</a></p>
      </footer>
    </div>

  ) : (
    <div>Getting the location data&hellip; </div>
  );
}

export default App
