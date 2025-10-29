/**
 * App theme configuration
 */

export const COLORS = {
    // Primary brand colors
    primary: "#3B82F6", // Modern blue
    secondary: "#0F172A", // Dark slate blue

    // Background colors
    background: "#F8FAFC", // Very light cool gray
    card: "#FFFFFF", // White
    cardAlt: "#F1F5F9", // Light cool gray for alternate cards

    // Text colors
    text: "#0F172A", // Dark slate blue (darker for better contrast)
    subtext: "#64748B", // Slate blue gray

    // Utility colors
    border: "#E2E8F0", // Cool gray border
    notification: "#EF4444", // Red
    success: "#10B981", // Emerald green
    warning: "#F59E0B", // Amber
    error: "#EF4444", // Red
    info: "#06B6D4", // Cyan

    // Gradient colors
    gradientStart: "#3B82F6", // Modern blue
    gradientMiddle: "#2563EB", // Darker blue
    gradientEnd: "#1D4ED8", // Even darker blue

    // Accent colors for visual variety
    accent1: "#8B5CF6", // Violet
    accent2: "#EC4899", // Pink
    accent3: "#06B6D4", // Cyan
};

export const SIZES = {
    // Global sizes
    base: 8,
    small: 12,
    font: 14,
    medium: 16,
    large: 18,
    xlarge: 24,
    xxlarge: 32,

    // Specific sizes
    borderRadius: 16,
    inputHeight: 56,
    buttonHeight: 56,
    screenPadding: 24,

    // Modern spacing scale
    spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 20,
        xl: 32,
        xxl: 48,
    },

    // Border radius variants
    radius: {
        xs: 4,
        sm: 8,
        md: 12,
        lg: 16,
        xl: 24,
        pill: 9999,
    },

    // Card styles
    card: {
        padding: 16,
        borderRadius: 16,
        gap: 12,
    },

    // Icon sizes
    icon: {
        small: 16,
        medium: 24,
        large: 32,
    },
};

export const FONTS = {
    regular: {
        fontFamily: "System",
        fontWeight: "400",
    },
    medium: {
        fontFamily: "System",
        fontWeight: "500",
    },
    semibold: {
        fontFamily: "System",
        fontWeight: "600",
    },
    bold: {
        fontFamily: "System",
        fontWeight: "700",
    },
    // Typography scale for different text roles
    heading1: {
        fontFamily: "System",
        fontWeight: "700",
        fontSize: 28,
        lineHeight: 36,
        letterSpacing: -0.5,
    },
    heading2: {
        fontFamily: "System",
        fontWeight: "700",
        fontSize: 24,
        lineHeight: 32,
        letterSpacing: -0.3,
    },
    heading3: {
        fontFamily: "System",
        fontWeight: "600",
        fontSize: 20,
        lineHeight: 28,
    },
    subtitle: {
        fontFamily: "System",
        fontWeight: "500",
        fontSize: 16,
        lineHeight: 24,
    },
    body: {
        fontFamily: "System",
        fontWeight: "400",
        fontSize: 14,
        lineHeight: 22,
    },
    caption: {
        fontFamily: "System",
        fontWeight: "400",
        fontSize: 12,
        lineHeight: 16,
    },
    button: {
        fontFamily: "System",
        fontWeight: "600",
        fontSize: 14,
        lineHeight: 20,
    },
};

export const SHADOWS = {
    none: {},
    small: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 1,
    },
    medium: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 3,
    },
    large: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 6,
        },
        shadowOpacity: 0.12,
        shadowRadius: 10,
        elevation: 6,
    },
    // Card effect with subtle shadow
    card: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    // Floating effect for important elements
    float: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 8,
    },
};