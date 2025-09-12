import React, { useContext, useEffect, useState } from "react";
import { View, Text, TextInput, Button, Modal, FlatList, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { WebView } from "react-native-webview";
import LocationContext from "./LocationContext";
import PlaceDetailModal from "./PlaceDetailModel";

const { width, height } = Dimensions.get("window");

const KakaoCategorySearchNative = ({ keyword, isAdmin }) => {
  const {
    currentPosition,
    setCurrentPosition,
    selectedAddress,
    setSelectedAddress,
    isCustomLocation,
    setIsCustomLocation,
  } = useContext(LocationContext);

  const [showModal, setShowModal] = useState(false);
  const [addressInput, setAddressInput] = useState("");
  const [showSearchPopup, setShowSearchPopup] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [places, setPlaces] = useState([]);

  // Kakao REST API를 통해 키워드 검색
  const fetchPlaces = async () => {
    if (!currentPosition) return;
    try {
      const res = await fetch(
        `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(
          keyword
        )}&x=${currentPosition.lng}&y=${currentPosition.lat}&radius=1000&size=5`,
        {
          headers: {
            Authorization: `KakaoAK ${process.env.KAKAO_REST_API_KEY}`, // REST API Key
          },
        }
      );
      const data = await res.json();
      const filtered = data.documents.map((place) => {
        const distance = getDistance(
          currentPosition.lat,
          currentPosition.lng,
          parseFloat(place.y),
          parseFloat(place.x)
        );
        return { ...place, distance };
      }).filter(p => p.distance <= 550)
        .sort((a,b)=>a.distance-b.distance);
      setPlaces(filtered);
    } catch (e) {
      console.error(e);
      setPlaces([]);
    }
  };

  useEffect(() => {
    fetchPlaces();
  }, [keyword, currentPosition]);

  // 거리 계산
  const getDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371e3;
    const toRad = (x) => (x * Math.PI) / 180;
    const φ1 = toRad(lat1);
    const φ2 = toRad(lat2);
    const Δφ = toRad(lat2 - lat1);
    const Δλ = toRad(lng2 - lng1);
    const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  };

  // 주소 설정
  const handleAddressSubmit = async () => {
    if (!addressInput.trim()) return;

    try {
      const res = await fetch(
        `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(addressInput)}`,
        { headers: { Authorization: `KakaoAK ${process.env.KAKAO_REST_API_KEY}` } }
      );
      const data = await res.json();
      if (data.documents.length > 0) {
        const { x, y, address_name } = data.documents[0];
        setCurrentPosition({ lat: parseFloat(y), lng: parseFloat(x) });
        setSelectedAddress(address_name);
        setIsCustomLocation(true);
        setShowModal(false);
      } else {
        setShowSearchPopup(true);
        setTimeout(() => setShowSearchPopup(false), 1000);
      }
    } catch (e) {
      console.error(e);
      setShowSearchPopup(true);
      setTimeout(() => setShowSearchPopup(false), 1000);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={{ padding: 10 }}>
        <Text style={{ fontSize: 18 }}>“{keyword}” 검색 결과</Text>
        <Button title="위치 설정" onPress={() => setShowModal(true)} />
        {selectedAddress && <Text style={{ color: "#555", marginTop: 5 }}>📍 설정된 위치: {selectedAddress}</Text>}
      </View>

      {/* 지도 */}
      <View style={{ flex: 1 }}>
        {currentPosition && (
          <WebView
            style={{ width, height: height * 0.4 }}
            source={{
              html: `
                <!DOCTYPE html>
                <html>
                <head>
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <script type="text/javascript" src="//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.KAKAO_JS_KEY}&libraries=services"></script>
                </head>
                <body>
                  <div id="map" style="width:100%;height:100%;"></div>
                  <script>
                    var map = new kakao.maps.Map(document.getElementById('map'), {
                      center: new kakao.maps.LatLng(${currentPosition.lat}, ${currentPosition.lng}),
                      level: 3
                    });
                    var marker = new kakao.maps.Marker({
                      map: map,
                      position: new kakao.maps.LatLng(${currentPosition.lat}, ${currentPosition.lng}),
                      title: "현재 위치"
                    });
                  </script>
                </body>
                </html>
              `,
            }}
          />
        )}
      </View>

      {/* 리스트 */}
      <FlatList
        data={places}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.placeItem}
            onPress={() => setSelectedPlace(item)}
          >
            <Text style={{ fontWeight: "bold" }}>{item.place_name}</Text>
            <Text>{item.road_address_name || item.address_name}</Text>
            <Text>📞 {item.phone || "전화번호 없음"}</Text>
            <Text>📏 거리: {item.distance}m</Text>
          </TouchableOpacity>
        )}
      />

      {/* 상세 모달 */}
      <PlaceDetailModal
        place={selectedPlace}
        onClose={() => setSelectedPlace(null)}
        // isAdmin={isAdmin}
      />

      {/* 주소 입력 모달 */}
      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modal}>
            <Text>주소 또는 장소명으로 위치 설정</Text>
            <TextInput
              style={styles.input}
              placeholder="예: 상세주소 혹은 시, 구, 동(읍)"
              value={addressInput}
              onChangeText={setAddressInput}
            />
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 10 }}>
              <Button title="설정" onPress={handleAddressSubmit} />
              <Button title="취소" onPress={() => setShowModal(false)} />
            </View>
          </View>
        </View>
      </Modal>

      {/* 검색 실패 토스트 */}
      {showSearchPopup && (
        <View style={styles.toastPopup}>
          <Text>❌ 장소 또는 주소를 찾을 수 없습니다.</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  placeItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "#000000aa",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    backgroundColor: "#fff",
    width: "80%",
    padding: 20,
    borderRadius: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    marginTop: 10,
    borderRadius: 5,
  },
  toastPopup: {
    position: "absolute",
    bottom: 50,
    left: 20,
    right: 20,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
  },
});

export default KakaoCategorySearchNative;
