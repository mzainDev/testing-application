import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { COLORS, FONTS, SHADOWS, SIZES } from "../theme/theme";

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
            Alert.alert("Missing Information", "Please fill in all required fields.");
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
                    Alert.alert("Booking Failed", "Unable to process your booking. Please try again.");
                }, 2000);
            }
        } catch (error) {
            setTimeout(() => {
                setLoading(false);
                Alert.alert("Error", "Failed to create booking. Please check your connection.");
            }, 2000);
        }
    };

    const getAmenities = (price) => {
        if (price >= 200) {
            return [
                { icon: "wifi", label: "High-Speed WiFi" },
                { icon: "tv", label: "Smart Display" },
                { icon: "coffee", label: "Refreshments" },
                { icon: "car", label: "Parking" }
            ];
        } else if (price >= 150) {
            return [
                { icon: "wifi", label: "WiFi" },
                { icon: "tv", label: "Display" },
                { icon: "coffee", label: "Coffee" }
            ];
        } else {
            return [
                { icon: "wifi", label: "WiFi" },
                { icon: "tv", label: "Display" }
            ];
        }
    };

    // Loading State
    if (fetchingRooms) {
        return (
            <View style={styles.centerContainer}>
                <View style={styles.loadingCard}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>Loading meeting rooms...</Text>
                    <Text style={styles.loadingSubtext}>Please wait a moment</Text>
                </View>
            </View>
        );
    }

    // Empty State
    if (rooms.length === 0) {
        return (
            <View style={styles.centerContainer}>
                <View style={styles.emptyStateCard}>
                    <View style={styles.emptyIconContainer}>
                        <MaterialIcons name="meeting-room" size={72} color={COLORS.primary} />
                    </View>
                    <Text style={styles.emptyTitle}>No Rooms Available</Text>
                    <Text style={styles.emptySubtext}>
                        There are currently no meeting rooms to display
                    </Text>
                    <TouchableOpacity onPress={fetchMeetingRooms} style={styles.retryButton}>
                        <Ionicons name="refresh" size={20} color="#FFF" />
                        <Text style={styles.retryText}>Refresh</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    // Main UI
    return (
        <View style={styles.container}>
            {/* Header */}
            <LinearGradient
                colors={[COLORS.gradientStart, COLORS.gradientMiddle, COLORS.gradientEnd]}
                style={styles.header}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <View style={styles.headerContent}>
                    <View>
                        <Text style={styles.headerTitle}>Meeting Rooms</Text>
                        <Text style={styles.headerSubtitle}>
                            Book your perfect workspace
                        </Text>
                    </View>
                    <View style={styles.headerBadge}>
                        <Text style={styles.headerBadgeText}>{rooms.length} Available</Text>
                    </View>
                </View>
            </LinearGradient>

            {/* Room List */}
            <FlatList
                data={rooms}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => {
                    const amenities = getAmenities(item.price);
                    return (
                        <View style={styles.roomCard}>
                            {/* Room Header */}
                            <View style={styles.roomHeader}>
                                <View style={styles.roomIconContainer}>
                                    <MaterialIcons name="meeting-room" size={32} color={COLORS.primary} />
                                </View>
                                <View style={styles.roomInfo}>
                                    <Text style={styles.roomName}>{item.name}</Text>
                                    <Text style={styles.roomDescription} numberOfLines={2}>
                                        {item.description}
                                    </Text>
                                </View>
                            </View>

                            {/* Price Badge */}
                            <View style={styles.priceBadge}>
                                <Text style={styles.priceLabel}>Starting from</Text>
                                <View style={styles.priceRow}>
                                    <Text style={styles.priceAmount}>SAR {item.price}</Text>
                                    <Text style={styles.pricePeriod}>/session</Text>
                                </View>
                            </View>

                            {/* Amenities */}
                            <View style={styles.amenitiesSection}>
                                <Text style={styles.amenitiesTitle}>Amenities</Text>
                                <View style={styles.amenitiesGrid}>
                                    {amenities.map((amenity, idx) => (
                                        <View key={idx} style={styles.amenityItem}>
                                            <View style={styles.amenityIcon}>
                                                <FontAwesome5
                                                    name={amenity.icon}
                                                    size={14}
                                                    color={COLORS.primary}
                                                />
                                            </View>
                                            <Text style={styles.amenityLabel}>{amenity.label}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>

                            {/* Book Button */}
                            <TouchableOpacity
                                style={styles.bookButton}
                                onPress={() => handleRoomSelect(item)}
                                activeOpacity={0.8}
                            >
                                <LinearGradient
                                    colors={[COLORS.primary, COLORS.gradientMiddle]}
                                    style={styles.bookButtonGradient}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                >
                                    <Text style={styles.bookButtonText}>Book Now</Text>
                                    <Ionicons name="arrow-forward" size={18} color="#FFF" />
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    );
                }}
            />

            {/* Booking Form Modal */}
            <Modal visible={showBookingForm} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <ScrollView
                            style={styles.formScrollView}
                            showsVerticalScrollIndicator={false}
                        >
                            {/* Form Header */}
                            <View style={styles.formHeader}>
                                <View>
                                    <Text style={styles.formTitle}>Complete your Booking</Text>
                                    <Text style={styles.formSubtitle}>
                                        {selectedRoom?.name}
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    onPress={() => setShowBookingForm(false)}
                                    style={styles.closeButton}
                                >
                                    <Ionicons name="close" size={24} color={COLORS.text} />
                                </TouchableOpacity>
                            </View>

                            {/* Form Fields */}
                            <View style={styles.formContent}>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Full Name *</Text>
                                    <View style={styles.inputContainer}>
                                        <Ionicons name="person-outline" size={20} color={COLORS.subtext} />
                                        <TextInput
                                            value={bookingData.name}
                                            onChangeText={(text) => handleInputChange("name", text)}
                                            style={styles.input}
                                            placeholder="Enter your full name"
                                            placeholderTextColor={COLORS.subtext}
                                        />
                                    </View>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Email Address *</Text>
                                    <View style={styles.inputContainer}>
                                        <Ionicons name="mail-outline" size={20} color={COLORS.subtext} />
                                        <TextInput
                                            value={bookingData.email}
                                            onChangeText={(text) => handleInputChange("email", text)}
                                            style={styles.input}
                                            placeholder="your.email@example.com"
                                            placeholderTextColor={COLORS.subtext}
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                        />
                                    </View>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Phone Number *</Text>
                                    <View style={styles.inputContainer}>
                                        <Ionicons name="call-outline" size={20} color={COLORS.subtext} />
                                        <TextInput
                                            value={bookingData.phone}
                                            onChangeText={(text) => handleInputChange("phone", text)}
                                            style={styles.input}
                                            placeholder="+923456789012"
                                            placeholderTextColor={COLORS.subtext}
                                            keyboardType="phone-pad"
                                        />
                                    </View>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Company Name</Text>
                                    <View style={styles.inputContainer}>
                                        <Ionicons name="business-outline" size={20} color={COLORS.subtext} />
                                        <TextInput
                                            value={bookingData.company}
                                            onChangeText={(text) => handleInputChange("company", text)}
                                            style={styles.input}
                                            placeholder="Your Company (Optional)"
                                            placeholderTextColor={COLORS.subtext}
                                        />
                                    </View>
                                </View>
                            </View>

                            {/* Form Actions */}
                            <View style={styles.formActions}>
                                <TouchableOpacity
                                    onPress={() => setShowBookingForm(false)}
                                    style={styles.cancelButton}
                                >
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={handleBookingSubmit}
                                    style={styles.submitButton}
                                >
                                    <LinearGradient
                                        colors={[COLORS.primary, COLORS.gradientMiddle]}
                                        style={styles.submitButtonGradient}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                    >
                                        <Text style={styles.submitButtonText}>Proceed to Payment</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Payment Processing Modal */}
            <Modal visible={openDialog} transparent animationType="fade">
                <View style={styles.dialogOverlay}>
                    <View style={styles.dialogContainer}>
                        {loading ? (
                            <>
                                <View style={styles.loadingSpinnerContainer}>
                                    <ActivityIndicator size="large" color={COLORS.primary} />
                                </View>
                                <Text style={styles.dialogTitle}>Processing Payment</Text>
                                <Text style={styles.dialogSubtext}>
                                    Please wait while we generate your payment link
                                </Text>
                            </>
                        ) : (
                            <>
                                <View style={styles.successIconContainer}>
                                    <Ionicons name="checkmark-circle" size={80} color={COLORS.success} />
                                </View>
                                <Text style={styles.dialogTitle}>Payment Link Sent!</Text>
                                <Text style={styles.dialogSubtext}>
                                    Check your WhatsApp for the payment link
                                </Text>
                                <TouchableOpacity
                                    onPress={() => setOpenDialog(false)}
                                    style={styles.dialogButton}
                                >
                                    <Text style={styles.dialogButtonText}>Got it</Text>
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
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    centerContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: COLORS.background,
        padding: SIZES.spacing.xl,
    },

    header: {
        paddingTop: 60,
        paddingBottom: 32,
        paddingHorizontal: SIZES.spacing.lg,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        ...SHADOWS.medium,
    },
    headerContent: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
    },
    headerTitle: {
        ...FONTS.heading1,
        color: "#FFFFFF",
        marginBottom: 4,
    },
    headerSubtitle: {
        ...FONTS.body,
        color: "rgba(255, 255, 255, 0.85)",
    },
    headerBadge: {
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: SIZES.radius.pill,
        backdropFilter: "blur(10px)",
    },
    headerBadgeText: {
        ...FONTS.caption,
        color: "#FFFFFF",
        fontWeight: "600",
    },

    // Loading State
    loadingCard: {
        backgroundColor: COLORS.card,
        borderRadius: SIZES.radius.lg,
        padding: SIZES.spacing.xxl,
        alignItems: "center",
        ...SHADOWS.card,
    },
    loadingText: {
        ...FONTS.subtitle,
        color: COLORS.text,
        marginTop: SIZES.spacing.md,
    },
    loadingSubtext: {
        ...FONTS.caption,
        color: COLORS.subtext,
        marginTop: SIZES.spacing.xs,
    },

    // Empty State
    emptyStateCard: {
        backgroundColor: COLORS.card,
        borderRadius: SIZES.radius.lg,
        padding: SIZES.spacing.xxl,
        alignItems: "center",
        maxWidth: 320,
        ...SHADOWS.card,
    },
    emptyIconContainer: {
        width: 120,
        height: 120,
        backgroundColor: `${COLORS.primary}15`,
        borderRadius: 60,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: SIZES.spacing.lg,
    },
    emptyTitle: {
        ...FONTS.heading2,
        color: COLORS.text,
        marginBottom: SIZES.spacing.sm,
    },
    emptySubtext: {
        ...FONTS.body,
        color: COLORS.subtext,
        textAlign: "center",
        marginBottom: SIZES.spacing.lg,
    },
    retryButton: {
        flexDirection: "row",
        backgroundColor: COLORS.primary,
        paddingHorizontal: SIZES.spacing.lg,
        paddingVertical: SIZES.spacing.md,
        borderRadius: SIZES.radius.md,
        alignItems: "center",
        gap: SIZES.spacing.sm,
        ...SHADOWS.small,
    },
    retryText: {
        ...FONTS.button,
        color: "#FFFFFF",
    },

    // Room List
    listContent: {
        padding: SIZES.spacing.lg,
        paddingBottom: 120,
    },
    roomCard: {
        backgroundColor: COLORS.card,
        borderRadius: SIZES.radius.lg,
        padding: SIZES.spacing.lg,
        marginBottom: SIZES.spacing.md,
        ...SHADOWS.card,
    },
    roomHeader: {
        flexDirection: "row",
        marginBottom: SIZES.spacing.md,
    },
    roomIconContainer: {
        width: 56,
        height: 56,
        backgroundColor: `${COLORS.primary}10`,
        borderRadius: SIZES.radius.md,
        justifyContent: "center",
        alignItems: "center",
        marginRight: SIZES.spacing.md,
    },
    roomInfo: {
        flex: 1,
    },
    roomName: {
        ...FONTS.heading3,
        color: COLORS.text,
        marginBottom: 4,
    },
    roomDescription: {
        ...FONTS.body,
        color: COLORS.subtext,
    },
    priceBadge: {
        backgroundColor: `${COLORS.primary}08`,
        borderRadius: SIZES.radius.md,
        padding: SIZES.spacing.md,
        marginBottom: SIZES.spacing.md,
        borderWidth: 1,
        borderColor: `${COLORS.primary}20`,
    },
    priceLabel: {
        ...FONTS.caption,
        color: COLORS.subtext,
        marginBottom: 2,
    },
    priceRow: {
        flexDirection: "row",
        alignItems: "baseline",
    },
    priceAmount: {
        ...FONTS.heading2,
        color: COLORS.primary,
        marginRight: 4,
    },
    pricePeriod: {
        ...FONTS.caption,
        color: COLORS.subtext,
    },
    amenitiesSection: {
        marginBottom: SIZES.spacing.md,
    },
    amenitiesTitle: {
        ...FONTS.button,
        color: COLORS.text,
        marginBottom: SIZES.spacing.sm,
    },
    amenitiesGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: SIZES.spacing.sm,
    },
    amenityItem: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLORS.background,
        paddingHorizontal: SIZES.spacing.md,
        paddingVertical: SIZES.spacing.sm,
        borderRadius: SIZES.radius.sm,
        gap: SIZES.spacing.sm,
    },
    amenityIcon: {
        width: 28,
        height: 28,
        backgroundColor: `${COLORS.primary}10`,
        borderRadius: 14,
        justifyContent: "center",
        alignItems: "center",
    },
    amenityLabel: {
        ...FONTS.caption,
        color: COLORS.text,
        fontWeight: "500",
    },
    bookButton: {
        borderRadius: SIZES.radius.md,
        overflow: "hidden",
        ...SHADOWS.small,
    },
    bookButtonGradient: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: SIZES.spacing.md,
        gap: SIZES.spacing.sm,
    },
    bookButtonText: {
        ...FONTS.button,
        color: "#FFFFFF",
    },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "flex-end",
    },
    modalContainer: {
        backgroundColor: COLORS.card,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: "90%",
        ...SHADOWS.float,
    },
    formScrollView: {
        maxHeight: "100%",
    },
    formHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        padding: SIZES.spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    formTitle: {
        ...FONTS.heading2,
        color: COLORS.text,
        marginBottom: 4,
    },
    formSubtitle: {
        ...FONTS.body,
        color: COLORS.subtext,
    },
    closeButton: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: COLORS.background,
        borderRadius: 20,
    },
    formContent: {
        padding: SIZES.spacing.lg,
    },
    inputGroup: {
        marginBottom: SIZES.spacing.md,

    },
    inputLabel: {
        ...FONTS.button,
        color: COLORS.text,
        marginBottom: SIZES.spacing.sm,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLORS.background,
        borderRadius: SIZES.radius.md,
        borderWidth: 1,
        borderColor: COLORS.border,
        paddingHorizontal: SIZES.spacing.md,
        height: 56,
    },
    input: {
        flex: 1,
        ...FONTS.body,
        color: COLORS.text,
        marginLeft: SIZES.spacing.sm,
        padding: 10,
    },
    formActions: {
        flexDirection: "row",
        padding: SIZES.spacing.lg,
        gap: SIZES.spacing.md,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: COLORS.background,
        borderRadius: SIZES.radius.md,
        paddingVertical: SIZES.spacing.md,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    cancelButtonText: {
        ...FONTS.button,
        color: COLORS.text,
    },
    submitButton: {
        flex: 1,
        borderRadius: SIZES.radius.md,
        overflow: "hidden",
        ...SHADOWS.small,
    },
    submitButtonGradient: {
        paddingVertical: SIZES.spacing.md,
        alignItems: "center",
        justifyContent: "center",
    },
    submitButtonText: {
        ...FONTS.button,
        color: "#FFFFFF",
    },

    // Dialog Styles
    dialogOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        justifyContent: "center",
        alignItems: "center",
        padding: SIZES.spacing.lg,
    },
    dialogContainer: {
        backgroundColor: COLORS.card,
        borderRadius: SIZES.radius.xl,
        padding: SIZES.spacing.xxl,
        alignItems: "center",
        width: width * 0.85,
        maxWidth: 400,
        ...SHADOWS.float,
    },
    loadingSpinnerContainer: {
        marginBottom: SIZES.spacing.lg,
    },
    successIconContainer: {
        marginBottom: SIZES.spacing.lg,
    },
    dialogTitle: {
        ...FONTS.heading2,
        color: COLORS.text,
        marginBottom: SIZES.spacing.sm,
        textAlign: "center",
    },
    dialogSubtext: {
        ...FONTS.body,
        color: COLORS.subtext,
        textAlign: "center",
        marginBottom: SIZES.spacing.lg,
    },
    dialogButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: SIZES.spacing.xl,
        paddingVertical: SIZES.spacing.md,
        borderRadius: SIZES.radius.md,
        minWidth: 120,
        ...SHADOWS.small,
    },
    dialogButtonText: {
        ...FONTS.button,
        color: "#FFFFFF",
        textAlign: "center",
    },
});