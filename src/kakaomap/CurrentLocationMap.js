import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Dimensions,
  Modal,
  TouchableOpacity,
} from "react-native";
import { WebView } from "react-native-webview";
import * as Location from "expo-location";

const { height } = Dimensions.get("window");

const CurrentLocationMap = () => {
  const [selectedAddress, setSelectedAddress] = useState("불러오는 중...");
  const [addressInput, setAddressInput] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showSearchPopup, setShowSearchPopup] = useState(false);
  const [currentPosition, setCurrentPosition] = useState({
    lat: 37.5665,
    lng: 126.9780,
  });

  const webviewRef = useRef(null);

  // ✅ 현재 위치 가져오기
  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setSelectedAddress("서울");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const coords = {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      };

      setCurrentPosition(coords);
      setSelectedAddress("현재 위치");

      // ✅ WebView에 위치 전달
      if (webviewRef.current) {
        webviewRef.current.postMessage(
          JSON.stringify({ type: "MOVE", coords })
        );
      }
    } catch (error) {
      console.log("위치 에러:", error);
      setSelectedAddress("서울");
    }
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  // ✅ WebView HTML
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>Kakao Map</title>
        <script src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=34434a9d903010f808dd3530f7776b4d&libraries=services"></script>
        <style>
          html, body, #map { margin:0; padding:0; width:100%; height:100%; }
          .current-location-pin {
            background-color: white;
            padding: 5px 10px;
            border-radius: 5px;
            border: 1px solid #ddd;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          var map, marker, overlay;

          function initMap(lat, lng, label) {
            var container = document.getElementById('map');
            var options = { center: new kakao.maps.LatLng(lat, lng), level: 3 };
            map = new kakao.maps.Map(container, options);

            marker = new kakao.maps.Marker({ position: new kakao.maps.LatLng(lat, lng) });
            marker.setMap(map);

            overlay = new kakao.maps.CustomOverlay({
              position: marker.getPosition(),
              content: '<div class="current-location-pin">🚩 ' + label + '</div>',
              yAnchor: 1.5
            });
            overlay.setMap(map);
          }

          // ✅ 최초 지도 로드
          initMap(${currentPosition.lat}, ${currentPosition.lng}, "${selectedAddress}");

          // ✅ 메시지 핸들러
          function handleMessage(event) {
            var data;
            try { data = JSON.parse(event.data); } catch(e) { return; }

            if (data.type === "MOVE") {
              var coords = new kakao.maps.LatLng(data.coords.lat, data.coords.lng);
              map.setCenter(coords);
              marker.setPosition(coords);
              overlay.setPosition(coords);
              overlay.setContent('<div class="current-location-pin">🚩 현재 위치</div>');
            }

            if (data.type === "SEARCH") {
              var geocoder = new kakao.maps.services.Geocoder();
              geocoder.addressSearch(data.address, function(result, status) {
                if (status === kakao.maps.services.Status.OK && result.length > 0) {
                  var coords = new kakao.maps.LatLng(result[0].y, result[0].x);
                  map.setCenter(coords);
                  marker.setPosition(coords);
                  overlay.setPosition(coords);

                  // ✅ 시/구/동/읍까지만 표시
                  var addr = result[0].address.region_1depth_name + " " +
                             result[0].address.region_2depth_name + " " +
                             result[0].address.region_3depth_name;

                  overlay.setContent('<div class="current-location-pin">🚩 ' + addr + '</div>');
                  window.ReactNativeWebView.postMessage(addr);
                } else {
                  window.ReactNativeWebView.postMessage("NOT_FOUND");
                }
              });
            }
          }

          // ✅ RN 메시지 리스너 (iOS/Android 모두 대응)
          document.addEventListener("message", handleMessage);
          window.addEventListener("message", handleMessage);
        </script>
      </body>
    </html>
  `;

  // ✅ 주소 입력
  const handleAddressSubmit = () => {
    if (!addressInput.trim()) return;
    webviewRef.current.postMessage(
      JSON.stringify({ type: "SEARCH", address: addressInput })
    );
    setShowModal(false);
  };

  // ✅ WebView → RN 메시지
  const handleWebViewMessage = (event) => {
    const msg = event.nativeEvent.data;
    if (msg === "NOT_FOUND") {
      setShowSearchPopup(true);
      setTimeout(() => setShowSearchPopup(false), 1500);
    } else {
      setSelectedAddress(msg);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🚩 현재 위치</Text>
        <Button title="위치 설정" onPress={() => setShowModal(true)} />
      </View>

      <Text style={{ fontSize: 14, color: "#555", marginVertical: 5 }}>
        📍 설정된 위치: {selectedAddress}
      </Text>

      {/* ✅ WebView */}
      <View style={{ height: height / 3 }}>
        <WebView
          ref={webviewRef}
          originWhitelist={["*"]}
          source={{ html }}
          javaScriptEnabled
          domStorageEnabled
          onMessage={handleWebViewMessage}
        />
      </View>

      {/* Modal */}
      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modal}>
            <Text style={{ marginBottom: 10 }}>주소 또는 장소명으로 위치 설정</Text>
            <TextInput
              placeholder="예: 서울 강남구 역삼동"
              value={addressInput}
              onChangeText={setAddressInput}
              style={styles.input}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.btn} onPress={handleAddressSubmit}>
                <Text style={styles.btnText}>설정</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btn} onPress={() => setShowModal(false)}>
                <Text style={styles.btnText}>취소</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Toast */}
      {showSearchPopup && (
        <View style={styles.toast}>
          <Text style={{ color: "white" }}>❌ 장소 또는 주소를 찾을 수 없습니다.</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 10 },
  title: { fontSize: 18 },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modal: { backgroundColor: "white", padding: 20, borderRadius: 10, width: "80%" },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 5, padding: 8, marginBottom: 10 },
  modalButtons: { flexDirection: "row", justifyContent: "space-between" },
  btn: { flex: 1, marginHorizontal: 5, padding: 10, backgroundColor: "#3498db", borderRadius: 5, alignItems: "center" },
  btnText: { color: "white", fontWeight: "bold" },
  toast: { position: "absolute", bottom: 50, left: 20, right: 20, backgroundColor: "#e74c3c", padding: 10, borderRadius: 5, alignItems: "center" },
});

export default CurrentLocationMap;
