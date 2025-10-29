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
    Dimensions,
    ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons, FontAwesome5, Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
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

    // Loading
    if (fetchingRooms) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#4F46E5" />
                <Text style={styles.loadingText}>Loading meeting rooms...</Text>
            </View>
        );
    }

    // Empty
    if (rooms.length === 0) {
        return (
            <View style={styles.center}>
                <MaterialIcons name="meeting-room" size={64} color="#9CA3AF" />
                <Text style={styles.noRooms}>No rooms available</Text>
                <TouchableOpacity onPress={fetchMeetingRooms} style={styles.retryBtn}>
                    <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Main UI
    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <LinearGradient colors={["#4F46E5", "#6366F1"]} style={styles.header}>
                <Text style={styles.headerTitle}>Book a Meeting Room</Text>
                <Text style={styles.headerSubtitle}>Choose your ideal workspace</Text>
            </LinearGradient>

            {/* Room List */}
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
                            <View style={styles.cardHeader}>
                                <MaterialIcons name="meeting-room" size={42} color="#4F46E5" />
                                <View style={{ flex: 1, marginLeft: 10 }}>
                                    <Text style={styles.roomName}>{item.name}</Text>
                                    <Text style={styles.roomDesc}>{item.description}</Text>
                                </View>
                            </View>
                            <Text style={styles.price}>SAR {item.price}</Text>
                            <View style={styles.amenities}>
                                {amenities.map((icon, idx) => (
                                    <FontAwesome5
                                        key={idx}
                                        name={icon}
                                        size={16}
                                        color="#6366F1"
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
                                value={bookingData[field]}
                                onChangeText={(text) => handleInputChange(field, text)}
                                style={styles.input}
                                placeholderTextColor="#888"
                                placeholder={field === "company" ? "Company (Optional)" : field === "phone" ? "+923456789012" : `Enter ${field}`}
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
                                <Ionicons name="checkmark-circle" size={80} color="#22C55E" />
                                <Text style={styles.dialogText}>Payment Link Sent!</Text>
                                <TouchableOpacity
                                    onPress={() => setOpenDialog(false)}
                                    style={[styles.btn, styles.submitBtn, { marginTop: 12 }]}
                                >
                                    <Text style={styles.submitText}>Got it</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
};

export default RoomBooking;

// --- STYLES ---
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F9FAFB" },
    header: {
        paddingVertical: 40,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerTitle: {
        color: "#FFF",
        fontSize: 26,
        fontWeight: "700",
    },
    headerSubtitle: {
        color: "#E0E7FF",
        fontSize: 14,
        marginTop: 6,
    },
    list: { padding: 16, paddingBottom: 120 },
    card: {
        backgroundColor: "#FFF",
        borderRadius: 16,
        padding: 16,
        marginBottom: 14,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardHeader: { flexDirection: "row", alignItems: "center" },
    roomName: { fontSize: 18, fontWeight: "600", color: "#111827" },
    roomDesc: { fontSize: 13, color: "#6B7280", marginTop: 2 },
    price: {
        fontSize: 16,
        color: "#4F46E5",
        fontWeight: "bold",
        marginTop: 8,
    },
    amenities: { flexDirection: "row", marginTop: 8 },
    icon: { marginRight: 12 },
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    formCard: {
        width: width * 0.9,
        backgroundColor: "#FFF",
        borderRadius: 16,
        padding: 20,
        elevation: 5,
    },
    formTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#111827",
        marginBottom: 16,
    },
    input: {
        borderWidth: 1,
        borderColor: "#D1D5DB",
        borderRadius: 10,
        padding: 12,
        marginBottom: 10,
        fontSize: 15,
        color: "#111827",
    },
    formActions: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
    btn: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: "center",
        marginHorizontal: 5,
    },
    cancelBtn: { backgroundColor: "#E5E7EB" },
    submitBtn: { backgroundColor: "#4F46E5" },
    cancelText: { color: "#374151", fontWeight: "bold" },
    submitText: { color: "#FFF", fontWeight: "bold" },
    dialog: {
        backgroundColor: "#FFF",
        borderRadius: 20,
        padding: 24,
        alignItems: "center",
        width: width * 0.8,
    },
    dialogText: { fontSize: 16, color: "#374151", marginTop: 12 },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    loadingText: { marginTop: 10, color: "#6B7280" },
    noRooms: { fontSize: 18, color: "#6B7280", marginVertical: 8 },
    retryBtn: {
        backgroundColor: "#4F46E5",
        padding: 10,
        borderRadius: 8,
        marginTop: 8,
    },
    retryText: { color: "#FFF", fontWeight: "bold" },
});
