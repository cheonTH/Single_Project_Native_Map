import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { View, Text, StyleSheet, Dimensions, Alert } from "react-native";
import MapView, { Marker, Callout } from "react-native-maps";
import * as Location from "expo-location";
import { GOOGLE_API_KEY } from "../api/AxiosApi";

const { height } = Dimensions.get("window");

const CurrentLocationMap = forwardRef((props, ref) => {
  const [currentPosition, setCurrentPosition] = useState({
    latitude: 37.5665,
    longitude: 126.9780,
  });
  const [selectedAddress, setSelectedAddress] = useState("불러오는 중...");
  const [searchMarkers, setSearchMarkers] = useState([]);
  const [showSearchPopup, setShowSearchPopup] = useState(false);
  const mapRef = useRef(null);

  // Haversine 공식으로 거리 계산
  const getDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (v) => (v * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  // 현재 위치 가져오기
  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setSelectedAddress("서울");
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      setCurrentPosition(coords);
      setSelectedAddress("현재 위치");
    } catch (error) {
      console.log("위치 에러:", error);
      setSelectedAddress("서울");
    }
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  // ref로 searchPlaces, moveToMarker 노출
  useImperativeHandle(ref, () => ({
    searchPlaces: async (keyword) => {
      if (!currentPosition) return;

      try {
        const { latitude, longitude } = currentPosition;
        const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=1500&keyword=${encodeURIComponent(
          keyword
        )}&language=ko&key=${GOOGLE_API_KEY}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.status === "OK") {
          let results = data.results.slice(0, 10);

          // 거리 계산 후 가까운 순 정렬
          results = results
            .map((place) => ({
              ...place,
              distance: getDistance(
                currentPosition.latitude,
                currentPosition.longitude,
                place.geometry.location.lat,
                place.geometry.location.lng
              ),
            }))
            .sort((a, b) => a.distance - b.distance);

          // Marker 상태 저장
          setSearchMarkers(
            results.map((place) => ({
              id: place.place_id,
              name: place.name,
              address: place.vicinity,
              location: place.geometry.location,
              distance: place.distance.toFixed(2),
            }))
          );

          // 부모 컴포넌트에 결과 전달 (place_id 포함)
          props.onSearchResult &&
            props.onSearchResult(
              results.map((place) => ({
                id: place.place_id, // place_id 포함
                name: place.name,
                address: place.vicinity,
                location: place.geometry.location,
                distance: place.distance.toFixed(2),
              }))
            );
        } else if (data.status === "ZERO_RESULTS") {
          setShowSearchPopup(true);
          setTimeout(() => setShowSearchPopup(false), 1500);
          setSearchMarkers([]);
          props.onSearchResult && props.onSearchResult([]);
        } else {
          Alert.alert("검색 오류", data.status);
          setSearchMarkers([]);
          props.onSearchResult && props.onSearchResult([]);
        }
      } catch (e) {
        console.log("검색 오류:", e);
        Alert.alert("검색 오류", e.message);
      }
    },
    moveToMarker: (lat, lng) => {
      if (mapRef.current) {
        mapRef.current.animateToRegion(
          {
            latitude: lat,
            longitude: lng,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          },
          500
        );
      }
    },
  }));

  return (
    <View style={{ flex: 1 }}>
      <View style={{ height: height / 3 }}>
        <MapView
          ref={mapRef}
          style={{ flex: 1 }}
          initialRegion={{
            latitude: currentPosition.latitude,
            longitude: currentPosition.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          showsUserLocation={true}
        >
          {/* 현재 위치 */}
          <Marker coordinate={currentPosition}>
            <Callout>
              <Text>🚩 {selectedAddress}</Text>
            </Callout>
          </Marker>

          {/* 검색 결과 */}
          {searchMarkers.map((marker) => (
            <Marker
              key={marker.id}
              coordinate={{
                latitude: marker.location.lat,
                longitude: marker.location.lng,
              }}
            >
              <Callout>
                <Text style={{ fontWeight: "bold" }}>{marker.name}</Text>
                <Text>{marker.address}</Text>
                <Text>거리: {marker.distance} km</Text>
              </Callout>
            </Marker>
          ))}
        </MapView>
      </View>

      {showSearchPopup && (
        <View style={styles.toast}>
          <Text style={{ color: "white" }}>❌ 장소를 찾을 수 없습니다.</Text>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  toast: {
    position: "absolute",
    bottom: 50,
    left: 20,
    right: 20,
    backgroundColor: "#e74c3c",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
});

export default CurrentLocationMap;
