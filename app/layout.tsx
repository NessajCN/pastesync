import "../styles/globals.css";
import type { AppProps } from "next/app";
import { createTheme, ThemeProvider } from "@mui/material/styles"; 
import CssBaseline from '@mui/material/CssBaseline';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  }
});

export default function RootLayout({
    // Layouts must accept a children prop.
    // This will be populated with nested layouts or pages
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      <html lang="en">
        <body>{children}</body>
      </html>
    );
  }
  