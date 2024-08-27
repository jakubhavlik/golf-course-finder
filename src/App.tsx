import './App.css'
import { useGeolocated } from "react-geolocated";
import { useGetGolfCourses } from './useGetGolfCourse';
import { useEffect, useState } from 'react';
import { useGetDistance } from './useGetDistance';


function App() {

  const { coords, isGeolocationAvailable, isGeolocationEnabled } =
    useGeolocated({
      positionOptions: {
        enableHighAccuracy: false,
      },
      userDecisionTimeout: 5000,
    });

  const { data, isLoading } = useGetGolfCourses({ center: { latitude: coords?.latitude, longitude: coords?.longitude }, distance: 50000 });

  const [currentlyLoadingCourse, setCurrentlyLoadingCourse] = useState<number | null>(null);

  const [loadedCourses, setLoadedCourses] = useState<Map<number, number>>(new Map());

  const [remainingCourses, setRemainingCourses] = useState<number[]>([]);

  const { data: distancesData, isLoading: distancesIsLoading } = useGetDistance({
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
      <h1>Closest golf courses</h1>
      {isLoading && !!data ? (
        <div>Loading the golf courses&hellip;</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Holes</th>
              <th>Location</th>
              <th>Distance</th>
            </tr>
          </thead>
          <tbody>
            {data?.elements.map((element) => (
              <tr key={element.id}>
                <td>{element.tags.name}</td>
                <td>{element.tags.holes} holes</td>
                <td>{element.tags.lat}, {element.tags.lon}</td>
                <td>
                  {loadedCourses.has(element.id) ? (
                    <>{loadedCourses.get(element.id)} meters</>
                  ) : <div>Loading&hellip;</div>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

      )}
    </div>
  ) : (
    <div>Getting the location data&hellip; </div>
  );
}

export default App
