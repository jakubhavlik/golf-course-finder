import axios from "axios";
import { useQuery } from "react-query";


export interface UsetGetGolfCoursesProps {
    center: { latitude?: number, longitude?: number },
    distance: number,
}

export interface CoursesResponse {
    elements: {
        id: number,
        tags: {
            holes: number,
            name: string,
            lat: number,
            lon: number,
        }
    }[]
}

export const useGetGolfCourses = (props: UsetGetGolfCoursesProps) => {
    return useQuery(
        [
            "useGetGolfCourses",
            props.center.latitude,
            props.center.longitude,
            props.distance,
        ],
        async () => {
            return await axios.post<CoursesResponse>("http://overpass-api.de/api/interpreter", `
        [out:json][timeout:25];

        way[leisure=golf_course](around:${props.distance},${props.center.latitude},${props.center.longitude})->.golf_courses;

        foreach.golf_courses->.course(
            node(area.course)[golf=pin]->.pins;
            make count holes = pins.count(nodes),
                       name = course.set(t["name"]),
                       lat = course.set(lat()),
                       lon = course.set(lon());
            out;
       )`).then((response) => response.data);
        },
        {
            refetchOnWindowFocus: false,
            retry: 1,
            enabled: !!props.center.latitude && !!props.center.longitude,
        },
    );
};
