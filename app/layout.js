import "./globals.css";

export const metadata = {
  title: "Nano Banana — AI Image Editor",
  description: "Generate and edit images with simple text prompts.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
