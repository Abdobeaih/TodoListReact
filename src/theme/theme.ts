import { createTheme } from "@mui/material/styles";

const BRAND = { light: "#5B54E8", dark: "#9E97FF" };
const BRAND_DARK_INK = "#3A34B8";
const ACCENT = { light: "#0E9384", dark: "#4FD8C4" };
const ACCENT_DARK_INK = "#0A6E63";

/** Poppins is self-hosted and carries the brand voice on headings only. */
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

/** UI and body copy use the platform stack: it is denser and more legible at small sizes. */
export const FONT_BODY = [
    "-apple-system",
    "BlinkMacSystemFont",
    '"Segoe UI"',
    "Roboto",
    '"Helvetica Neue"',
    "Arial",
    "sans-serif",
].join(", ");

/** Height of the sticky app bar; group headers offset by the same amount. */
export const APP_BAR_HEIGHT = { xs: 56, sm: 64 } as const;

/** Shadows are reserved for true overlays so flat surfaces stay flat. */
const OVERLAY_SHADOW = "0 16px 40px rgba(10, 12, 24, 0.18), 0 2px 6px rgba(10, 12, 24, 0.08)";

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
                background: { default: "#FAFAFB", paper: "#FFFFFF" },
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
                background: { default: "#0E1016", paper: "#141720" },
                divider: "rgba(255, 255, 255, 0.10)",
                success: { main: "#3DD68C" },
                warning: { main: "#F5A524" },
                error: { main: "#F87171" },
                info: { main: "#5EA9FF" },
            },
        },
    },
    shape: { borderRadius: 8 },
    typography: {
        fontFamily: FONT_BODY,
        fontSize: 14,
        h1: {
            fontFamily: FONT_HEADING,
            fontSize: "1.625rem",
            lineHeight: 1.2,
            fontWeight: 600,
            letterSpacing: "-0.02em",
        },
        h2: {
            fontFamily: FONT_HEADING,
            fontSize: "1.3125rem",
            lineHeight: 1.25,
            fontWeight: 600,
            letterSpacing: "-0.01em",
        },
        h3: {
            fontFamily: FONT_HEADING,
            fontSize: "1.0625rem",
            lineHeight: 1.3,
            fontWeight: 600,
            letterSpacing: "-0.01em",
        },
        h4: { fontFamily: FONT_HEADING, fontSize: "0.9375rem", lineHeight: 1.4, fontWeight: 600 },
        h5: { fontFamily: FONT_BODY, fontSize: "0.9375rem", lineHeight: 1.4, fontWeight: 500 },
        h6: { fontFamily: FONT_BODY, fontSize: "0.8125rem", lineHeight: 1.4, fontWeight: 600 },
        subtitle1: { fontFamily: FONT_BODY, fontSize: "0.875rem", fontWeight: 600 },
        subtitle2: { fontFamily: FONT_BODY, fontSize: "0.8125rem", fontWeight: 600 },
        body1: { fontSize: "0.875rem" },
        body2: { fontSize: "0.8125rem" },
        caption: { fontSize: "0.75rem" },
        button: { textTransform: "none", fontWeight: 500 },
        overline: { fontWeight: 600, letterSpacing: "0.06em" },
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    backgroundColor: "var(--mui-palette-background-default)",
                    color: "var(--mui-palette-text-primary)",
                    minHeight: "100vh",
                },
                "*::selection": { backgroundColor: "rgba(91, 84, 232, 0.20)" },
                "::-webkit-scrollbar": { width: 10, height: 10 },
                "::-webkit-scrollbar-thumb": {
                    backgroundColor: "var(--mui-palette-divider)",
                    borderRadius: 999,
                },
            },
        },
        MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    border: "1px solid var(--mui-palette-divider)",
                    boxShadow: "none",
                },
            },
        },
        MuiButton: {
            defaultProps: { disableElevation: true },
            styleOverrides: {
                root: { borderRadius: 8, paddingInline: 14, minHeight: 36 },
                sizeLarge: { minHeight: 42, fontSize: "0.875rem" },
                sizeSmall: { minHeight: 30, fontSize: "0.8125rem" },
            },
        },
        MuiIconButton: { styleOverrides: { root: { borderRadius: 8 } } },
        MuiOutlinedInput: { styleOverrides: { root: { borderRadius: 8 } } },
        MuiFilledInput: { styleOverrides: { root: { borderRadius: 8 } } },
        MuiChip: {
            styleOverrides: {
                root: { borderRadius: 6, fontWeight: 500 },
                sizeSmall: { height: 22, fontSize: "0.6875rem" },
                label: { paddingInline: 7 },
            },
        },
        MuiLinearProgress: {
            styleOverrides: {
                root: {
                    borderRadius: 999,
                    height: 3,
                    backgroundColor: "var(--mui-palette-divider)",
                },
                bar: { borderRadius: 999 },
            },
        },
        MuiTooltip: {
            styleOverrides: {
                tooltip: {
                    borderRadius: 6,
                    fontSize: "0.75rem",
                    backgroundColor: "#1B1E27",
                    padding: "5px 9px",
                },
                arrow: { color: "#1B1E27" },
            },
        },
        MuiDialog: {
            styleOverrides: {
                paper: {
                    borderRadius: 12,
                    border: "1px solid var(--mui-palette-divider)",
                    boxShadow: OVERLAY_SHADOW,
                },
            },
        },
        MuiDialogTitle: {
            styleOverrides: {
                root: { fontWeight: 600, fontSize: "1rem", padding: "20px 24px 8px" },
            },
        },
        MuiDialogContent: { styleOverrides: { root: { padding: "8px 24px 4px" } } },
        MuiDialogActions: { styleOverrides: { root: { padding: "12px 24px 20px" } } },
        MuiMenu: {
            styleOverrides: {
                paper: {
                    borderRadius: 10,
                    border: "1px solid var(--mui-palette-divider)",
                    marginTop: 4,
                    boxShadow: OVERLAY_SHADOW,
                },
            },
        },
        MuiMenuItem: {
            styleOverrides: { root: { borderRadius: 6, marginInline: 6, minHeight: 36 } },
        },
        MuiSelect: { styleOverrides: { icon: { right: 8 } } },
        MuiSnackbarContent: { styleOverrides: { root: { borderRadius: 8, fontWeight: 500 } } },
        MuiTab: { styleOverrides: { root: { textTransform: "none", fontWeight: 500 } } },
    },
});
