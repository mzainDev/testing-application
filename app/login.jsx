import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
    Alert,
    Dimensions,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { Button, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, FONTS, SHADOWS, SIZES } from "./theme/theme";
// import { EXPO_PUBLIC_BASE_URL } from "@env";

const { width } = Dimensions.get("window");

const BASE_URL = "https://rawdhat.com/api";

export default function LoginScreen() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const authenticate = async (data) => {
        setLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    email: data.email.trim().toLowerCase(),
                    password: data.password,
                    remember: data.remember,
                }),
            });

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.error || "Authentication failed");
            }

            return responseData;
        } catch (error) {
            console.error("Authentication error:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async () => {
        setErrors({});
        let formErrors = {};

        if (!email) formErrors.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(email))
            formErrors.email = "Invalid email format";

        if (!password) formErrors.password = "Password is required";
        else if (password.length < 6)
            formErrors.password = "Password must be at least 6 characters";

        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }

        try {
            const res = await authenticate({ email, password, remember: true });
            console.log("Login success:", res);

            // Store the access token and user data in AsyncStorage
            if (res.accessToken || res.token) {
                const accessToken = res.accessToken || res.token;
                await AsyncStorage.setItem('accessToken', accessToken);

                // Store user data if available
                if (res.userData || res.user) {
                    const userData = res.userData || res.user;
                    await AsyncStorage.setItem('userData', JSON.stringify(userData));
                    console.log("User data stored successfully");
                }

                console.log("Token stored successfully");

                Alert.alert('Success', 'Login successful!');
                router.replace("/");
            } else {
                console.log("No access token found in response:", res);
                Alert.alert('Error', 'Login failed: No access token received');
            }
        } catch (err) {
            console.error("Login failed:", err.message);
            Alert.alert('Error', err.message || 'Login failed. Please try again.');
        }
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <StatusBar style="dark" />
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
            >
                <ScrollView
                    contentContainerStyle={styles.container}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header Background */}
                    <View style={styles.headerBackground}>
                        <LinearGradient
                            colors={[COLORS.gradientStart, COLORS.gradientEnd]}
                            style={styles.gradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        />
                    </View>

                    {/* Logo */}
                    <View style={styles.logoContainer}>
                        <Image
                            source={require("../assets/images/rawdhat.png")}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                    </View>

                    {/* Login Card */}
                    <View style={styles.card}>
                        <Text style={styles.title}>Welcome Back</Text>
                        <Text style={styles.subtitle}>Sign in to continue</Text>

                        {/* Form */}
                        <View style={styles.formContainer}>
                            <TextInput
                                label="Email"
                                mode="outlined"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                left={<TextInput.Icon icon={() => (
                                    <Ionicons name="mail-outline" size={20} color={COLORS.primary} />
                                )} />}
                                error={!!errors.email}
                                style={{ marginBottom: 10 }}
                            />
                            {errors.email && (
                                <Text style={{ color: "red", fontSize: 12 }}>{errors.email}</Text>
                            )}

                            <TextInput
                                label="Password"
                                mode="outlined"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                                left={<TextInput.Icon icon={() => (
                                    <Ionicons name="lock-closed-outline" size={20} color={COLORS.primary} />
                                )} />}
                                error={!!errors.password}
                                style={{ marginBottom: 10 }}
                            />
                            {errors.password && (
                                <Text style={{ color: "red", fontSize: 12 }}>{errors.password}</Text>
                            )}

                            <TouchableOpacity style={styles.forgotPasswordContainer}>
                                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                            </TouchableOpacity>

                            <Button
                                mode="contained"
                                onPress={handleLogin}
                                loading={loading}
                                style={styles.loginButton}
                                contentStyle={{ paddingVertical: 6 }}
                            >
                                Sign In
                            </Button>
                        </View>

                        {/* Divider */}
                        <View style={styles.dividerContainer}>
                            <View style={styles.divider} />
                            <Text style={styles.dividerText}>Or continue with</Text>
                            <View style={styles.divider} />
                        </View>

                        {/* Social Login */}
                        <View style={styles.socialButtonsContainer}>
                            <TouchableOpacity style={styles.socialButton}>
                                <Ionicons name="logo-google" size={22} color="#DB4437" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.socialButton}>
                                <Ionicons name="logo-apple" size={22} color="#000000" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.socialButton}>
                                <Ionicons name="logo-facebook" size={22} color="#4267B2" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: COLORS.background,
    },
    headerBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 220,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        overflow: 'hidden',
    },
    gradient: {
        flex: 1,
    },
    logoContainer: {
        alignItems: "center",
        justifyContent: "center",
        height: 200,
    },
    logo: {
        width: 200,
        height: 100,
    },
    card: {
        backgroundColor: COLORS.card,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        marginHorizontal: SIZES.base,
        paddingHorizontal: SIZES.screenPadding,
        paddingTop: SIZES.xlarge,
        paddingBottom: SIZES.medium,
        flex: 1,
        ...SHADOWS.medium,
    },
    title: {
        ...FONTS.bold,
        fontSize: SIZES.xxlarge,
        color: COLORS.text,
        textAlign: "center",
    },
    subtitle: {
        ...FONTS.regular,
        fontSize: SIZES.medium,
        color: COLORS.subtext,
        textAlign: "center",
        marginTop: SIZES.base / 2,
        marginBottom: SIZES.xlarge,
    },
    formContainer: {
        width: "100%",
    },
    forgotPasswordContainer: {
        alignSelf: "flex-end",
        marginBottom: SIZES.medium,
    },
    forgotPasswordText: {
        ...FONTS.medium,
        fontSize: SIZES.small,
        color: COLORS.primary,
    },
    loginButton: {
        marginVertical: SIZES.medium,

    },
    dividerContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: SIZES.large,
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: COLORS.border,
    },
    dividerText: {
        ...FONTS.regular,
        fontSize: SIZES.small,
        color: COLORS.subtext,
        marginHorizontal: SIZES.medium,
    },
    socialButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: SIZES.large,
    },
    socialButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: COLORS.card,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: SIZES.small,
        ...SHADOWS.small,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
});