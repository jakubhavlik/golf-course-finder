import axios from "axios";
import { useQuery } from "react-query";

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

export interface UsetGetGolfCoursesProps {
    from: { latitude?: number, longitude?: number },
    to: { latitude?: number, longitude?: number },
}

/*
{"code":"Ok",
"routes":[{"legs":[{"steps":[],"summary":"","weight":6352.5,"duration":3010.5,"distance":35126.2}],"weight_name":"routability","weight":6352.5,"duration":3010.5,"distance":35126.2}]}
*/
export interface DistanceResponse {
    routes: {
        duration: number,
        distance: number,
    }[]
}

export const useGetDistance = (props: UsetGetGolfCoursesProps) => {
    return useQuery(
        [
            "useGetDistance",
            props.from.latitude,
            props.from.longitude,
            props.to.latitude,
            props.to.longitude,
        ],
        async () => {
            await sleep(1000);
            return await axios.get<DistanceResponse>(`http://router.project-osrm.org/route/v1/driving/${props.from.longitude},${props.from.latitude};${props.to.longitude},${props.to.latitude}?overview=false`).then((response) => response.data);
        },
        {
            refetchOnWindowFocus: false,
            retry: 1,
            enabled: !!props.from.latitude && !!props.to.longitude && !!props.to.latitude && !!props.to.longitude,
            staleTime: 1000 * 60 * 60, // 1 hour
        },
    );
};
