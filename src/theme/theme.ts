import { createTheme } from "@mui/material/styles";

const BRAND = { light: "#5B54E8", dark: "#9E97FF" };
const BRAND_DARK_INK = "#3A34B8";
const ACCENT = { light: "#0E9384", dark: "#4FD8C4" };
const ACCENT_DARK_INK = "#0A6E63";

/** Poppins carries the brand voice on headings; the body stack stays highly legible. */
export const FONT_HEADING = [
    '"Poppins"',
    "-apple-system",
    "BlinkMacSystemFont",
    '"Segoe UI"',
    "Roboto",
    '"Helvetica Neue"',
    "Arial",
    "sans-serif",
].join(", ");

export const FONT_BODY = [
    '"Inter var"',
    "Inter",
    "-apple-system",
    "BlinkMacSystemFont",
    '"Segoe UI"',
    "Roboto",
    '"Helvetica Neue"',
    "Arial",
    "sans-serif",
].join(", ");

const ELEVATED_SHADOW = "0 18px 48px rgba(10, 12, 24, 0.22)";
const CARD_SHADOW = "0 1px 2px rgba(16, 18, 40, 0.05)";

export const MODE_STORAGE_KEY = "taskflow.colorMode";

export const theme = createTheme({
    cssVariables: {
        // The default "media" selector makes the manual light/dark toggle a no-op.
        // Using a data attribute also lets index.html pre-apply the scheme to avoid a flash.
        colorSchemeSelector: "data-mui-color-scheme",
    },
    colorSchemes: {
        light: {
            palette: {
                mode: "light",
                primary: { main: BRAND.light, dark: BRAND_DARK_INK, contrastText: "#FFFFFF" },
                secondary: { main: ACCENT.light, dark: ACCENT_DARK_INK, contrastText: "#FFFFFF" },
                background: { default: "#F6F6FB", paper: "#FFFFFF" },
                divider: "rgba(16, 18, 40, 0.10)",
                success: { main: "#12855F" },
                warning: { main: "#B45309" },
                error: { main: "#C62F3E" },
                info: { main: "#1B6FD4" },
            },
        },
        dark: {
            palette: {
                mode: "dark",
                primary: { main: BRAND.dark, dark: "#7C74F5", contrastText: "#14121F" },
                secondary: { main: ACCENT.dark, dark: "#31B7A6", contrastText: "#06201D" },
                background: { default: "#0E1016", paper: "#171A22" },
                divider: "rgba(255, 255, 255, 0.10)",
                success: { main: "#3DD68C" },
                warning: { main: "#F5A524" },
                error: { main: "#F87171" },
                info: { main: "#5EA9FF" },
            },
        },
    },
    shape: { borderRadius: 12 },
    typography: {
        fontFamily: FONT_BODY,
        fontSize: 14,
        h1: {
            fontFamily: FONT_HEADING,
            fontSize: "1.75rem",
            lineHeight: 1.2,
            fontWeight: 700,
            letterSpacing: "-0.02em",
        },
        h2: {
            fontFamily: FONT_HEADING,
            fontSize: "1.375rem",
            lineHeight: 1.25,
            fontWeight: 700,
            letterSpacing: "-0.01em",
        },
        h3: {
            fontFamily: FONT_HEADING,
            fontSize: "1.125rem",
            lineHeight: 1.3,
            fontWeight: 600,
            letterSpacing: "-0.01em",
        },
        h4: { fontFamily: FONT_HEADING, fontSize: "1.0625rem", lineHeight: 1.35, fontWeight: 600 },
        h5: { fontFamily: FONT_HEADING, fontSize: "0.9375rem", lineHeight: 1.4, fontWeight: 600 },
        h6: { fontFamily: FONT_HEADING, fontSize: "0.875rem", lineHeight: 1.4, fontWeight: 600 },
        subtitle1: { fontFamily: FONT_HEADING, fontSize: "0.9375rem", fontWeight: 600 },
        subtitle2: { fontFamily: FONT_HEADING, fontSize: "0.8125rem", fontWeight: 600 },
        body1: { fontSize: "0.9375rem" },
        body2: { fontSize: "0.8125rem" },
        caption: { fontSize: "0.75rem" },
        button: { fontFamily: FONT_HEADING, textTransform: "none", fontWeight: 600 },
        overline: { fontFamily: FONT_HEADING, fontWeight: 700, letterSpacing: "0.08em" },
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    backgroundColor: "var(--mui-palette-background-default)",
                    backgroundImage:
                        "radial-gradient(1100px 520px at 10% -10%, rgba(91, 84, 232, 0.12), transparent 60%), radial-gradient(900px 460px at 95% -5%, rgba(14, 147, 132, 0.10), transparent 55%)",
                    backgroundAttachment: "fixed",
                    minHeight: "100vh",
                },
                "*::selection": { backgroundColor: "rgba(91, 84, 232, 0.24)" },
                "::-webkit-scrollbar": { width: 10, height: 10 },
                "::-webkit-scrollbar-thumb": {
                    backgroundColor: "var(--mui-palette-divider)",
                    borderRadius: 8,
                },
            },
        },
        MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 16,
                    border: "1px solid var(--mui-palette-divider)",
                    boxShadow: CARD_SHADOW,
                },
            },
        },
        MuiButton: {
            defaultProps: { disableElevation: true },
            styleOverrides: {
                root: { borderRadius: 10, paddingInline: 16, minHeight: 40 },
                sizeLarge: { minHeight: 48, fontSize: "0.9375rem" },
            },
        },
        MuiIconButton: { styleOverrides: { root: { borderRadius: 10 } } },
        MuiOutlinedInput: { styleOverrides: { root: { borderRadius: 10 } } },
        MuiFilledInput: { styleOverrides: { root: { borderRadius: 10 } } },
        MuiInputLabel: { styleOverrides: { root: { fontFamily: FONT_HEADING } } },
        MuiChip: {
            styleOverrides: {
                root: { borderRadius: 8, fontWeight: 600, fontFamily: FONT_HEADING },
                sizeSmall: { height: 24, fontSize: "0.6875rem" },
                label: { paddingInline: 8 },
                icon: { fontSize: "0.875rem" },
            },
        },
        MuiLinearProgress: { styleOverrides: { root: { borderRadius: 999, height: 8 } } },
        MuiToggleButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    textTransform: "none",
                    fontWeight: 600,
                    fontFamily: FONT_HEADING,
                },
            },
        },
        MuiTooltip: {
            styleOverrides: {
                tooltip: {
                    borderRadius: 8,
                    fontSize: "0.75rem",
                    backgroundColor: "#1B1E27",
                    padding: "6px 10px",
                },
                arrow: { color: "#1B1E27" },
            },
        },
        MuiDialog: {
            styleOverrides: {
                paper: {
                    borderRadius: 20,
                    border: "1px solid var(--mui-palette-divider)",
                    boxShadow: ELEVATED_SHADOW,
                },
            },
        },
        MuiDialogTitle: {
            styleOverrides: {
                root: {
                    fontFamily: FONT_HEADING,
                    fontWeight: 600,
                    fontSize: "1.125rem",
                    padding: "20px 24px 8px",
                },
            },
        },
        MuiDialogContent: { styleOverrides: { root: { padding: "8px 24px 4px" } } },
        MuiDialogActions: { styleOverrides: { root: { padding: "12px 24px 20px" } } },
        MuiMenu: {
            styleOverrides: {
                paper: {
                    borderRadius: 14,
                    border: "1px solid var(--mui-palette-divider)",
                    marginTop: 6,
                    boxShadow: ELEVATED_SHADOW,
                },
            },
        },
        MuiMenuItem: {
            styleOverrides: { root: { borderRadius: 8, marginInline: 6, minHeight: 38 } },
        },
        MuiSelect: { styleOverrides: { icon: { right: 10 } } },
        MuiAlert: {
            styleOverrides: {
                root: { borderRadius: 12, fontFamily: FONT_HEADING, alignItems: "center" },
            },
        },
        MuiSnackbarContent: { styleOverrides: { root: { borderRadius: 12, fontWeight: 500 } } },
        MuiTab: {
            styleOverrides: {
                root: { textTransform: "none", fontWeight: 600, fontFamily: FONT_HEADING },
            },
        },
    },
});
