import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    Modal,
    ActivityIndicator,
    StyleSheet,
    Alert,
    ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons, FontAwesome5, Ionicons } from "@expo/vector-icons";

const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;

const RoomBooking = () => {
    const [rooms, setRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetchingRooms, setFetchingRooms] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [showBookingForm, setShowBookingForm] = useState(false);
    const [centerId, setCenterId] = useState("");
    const [bookingData, setBookingData] = useState({
        name: "",
        email: "",
        phone: "",
        company: "",
    });

    useEffect(() => {
        (async () => {
            const userData = await AsyncStorage.getItem("userData");
            if (userData) {
                const parsed = JSON.parse(userData);
                setCenterId(parsed.centerId);
            }
            fetchMeetingRooms();
        })();
    }, []);

    const fetchMeetingRooms = async () => {
        const accessToken = await AsyncStorage.getItem("accessToken");
        

        try {
            const response = await fetch(`${BASE_URL}/admin/meetingRooms`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            if (response.ok) {
                const res = await response.json();
                setRooms(res.data || []);
            } else {
                Alert.alert("Error", "Failed to fetch rooms");
            }
        } catch (err) {
            Alert.alert("Error", "Unable to load rooms");
        } finally {
            setFetchingRooms(false);
        }
    };

    const handleRoomSelect = (room) => {
        setSelectedRoom(room);
        setShowBookingForm(true);
    };

    const handleInputChange = (key, value) => {
        setBookingData((prev) => ({ ...prev, [key]: value }));
    };

    const handleBookingSubmit = async () => {
        if (!bookingData.name || !bookingData.email || !bookingData.phone) {
            Alert.alert("Missing info", "Please fill in all required fields.");
            return;
        }

        setLoading(true);
        setShowBookingForm(false);
        setOpenDialog(true);

        const accessToken = await AsyncStorage.getItem("accessToken");

        try {
            const response = await fetch(`${BASE_URL}/admin/createBookingWithPayment`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    meetingRoomId: selectedRoom.id,
                    name: bookingData.name,
                    email: bookingData.email,
                    phone: bookingData.phone,
                    company: bookingData.company,
                    centerId: centerId,
                }),
            });

            if (response.ok) {
                await response.json();
                setTimeout(() => setLoading(false), 2000);
            } else {
                setTimeout(() => {
                    setLoading(false);
                    Alert.alert("Booking failed");
                }, 2000);
            }
        } catch (error) {
            setTimeout(() => {
                setLoading(false);
                Alert.alert("Error", "Failed to create booking");
            }, 2000);
        }
    };

    const getAmenities = (price) => {
        if (price >= 200) {
            return ["wifi", "tv", "coffee", "car"];
        } else if (price >= 150) {
            return ["wifi", "tv", "coffee"];
        } else {
            return ["wifi", "tv"];
        }
    };

    if (fetchingRooms) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#4F46E5" />
                <Text style={styles.loadingText}>Loading meeting rooms...</Text>
            </View>
        );
    }

    if (rooms.length === 0) {
        return (
            <View style={styles.center}>
                <MaterialIcons name="hotel" size={64} color="gray" />
                <Text style={styles.noRooms}>No rooms available</Text>
                <TouchableOpacity onPress={fetchMeetingRooms} style={styles.retryBtn}>
                    <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Meeting Room Booking</Text>

            <FlatList
                data={rooms}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => {
                    const amenities = getAmenities(item.price);
                    return (
                        <TouchableOpacity
                            style={styles.card}
                            onPress={() => handleRoomSelect(item)}
                        >
                            <MaterialIcons name="meeting-room" size={48} color="#4F46E5" />
                            <Text style={styles.roomName}>{item.name}</Text>
                            <Text style={styles.roomDesc}>{item.description}</Text>
                            <Text style={styles.price}>SAR {item.price}</Text>
                            <View style={styles.amenities}>
                                {amenities.map((icon, idx) => (
                                    <FontAwesome5
                                        key={idx}
                                        name={icon}
                                        size={16}
                                        color="#4F46E5"
                                        style={styles.icon}
                                    />
                                ))}
                            </View>
                        </TouchableOpacity>
                    );
                }}
            />

            {/* Booking Form Modal */}
            <Modal visible={showBookingForm} transparent animationType="slide">
                <View style={styles.overlay}>
                    <View style={styles.formCard}>
                        <Text style={styles.formTitle}>Complete Your Booking</Text>

                        {["name", "email", "phone", "company"].map((field) => (
                            <TextInput
                                key={field}
                                placeholder={`Enter ${field}`}
                                value={bookingData[field]}
                                onChangeText={(text) => handleInputChange(field, text)}
                                style={styles.input}
                                keyboardType={field === "phone" ? "phone-pad" : "default"}
                            />
                        ))}

                        <View style={styles.formActions}>
                            <TouchableOpacity
                                onPress={() => setShowBookingForm(false)}
                                style={[styles.btn, styles.cancelBtn]}
                            >
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={handleBookingSubmit}
                                style={[styles.btn, styles.submitBtn]}
                            >
                                <Text style={styles.submitText}>Proceed</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Payment Modal */}
            <Modal visible={openDialog} transparent animationType="fade">
                <View style={styles.overlay}>
                    <View style={styles.dialog}>
                        {loading ? (
                            <>
                                <ActivityIndicator size="large" color="#4F46E5" />
                                <Text style={styles.dialogText}>Processing payment...</Text>
                            </>
                        ) : (
                            <>
                                <Ionicons name="checkmark-circle" size={72} color="green" />
                                <Text style={styles.dialogText}>Payment Link Sent!</Text>
                                <TouchableOpacity
                                    onPress={() => setOpenDialog(false)}
                                    style={styles.submitBtn}
                                >
                                    <Text style={styles.submitText}>Got it!</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default RoomBooking;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#EEF2FF", padding: 16 },
    title: { fontSize: 24, fontWeight: "bold", color: "#1E1E1E", marginBottom: 12 },
    list: { paddingBottom: 100 },
    card: {
        backgroundColor: "#FFF",
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        elevation: 2,
    },
    roomName: { fontSize: 18, fontWeight: "bold", color: "#111" },
    roomDesc: { fontSize: 14, color: "gray", marginVertical: 4 },
    price: { fontSize: 16, color: "#4F46E5", fontWeight: "bold", marginTop: 6 },
    amenities: { flexDirection: "row", marginTop: 8 },
    icon: { marginRight: 10 },
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        padding: 20,
    },
    formCard: {
        backgroundColor: "#FFF",
        borderRadius: 12,
        padding: 16,
    },
    formTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 12 },
    input: {
        borderWidth: 1,
        borderColor: "#CCC",
        borderRadius: 8,
        padding: 10,
        marginBottom: 8,
    },
    formActions: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
    btn: { flex: 1, padding: 10, borderRadius: 8, alignItems: "center", marginHorizontal: 4 },
    cancelBtn: { backgroundColor: "#EEE" },
    submitBtn: { backgroundColor: "#4F46E5" },
    cancelText: { color: "#333", fontWeight: "bold" },
    submitText: { color: "#FFF", fontWeight: "bold" },
    dialog: {
        backgroundColor: "#FFF",
        borderRadius: 16,
        padding: 20,
        alignItems: "center",
    },
    dialogText: { fontSize: 16, color: "#333", marginTop: 12 },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    loadingText: { marginTop: 10, color: "#666" },
    noRooms: { fontSize: 18, color: "#666", marginVertical: 8 },
    retryBtn: { backgroundColor: "#4F46E5", padding: 10, borderRadius: 8 },
    retryText: { color: "#FFF", fontWeight: "bold" },
});
