import './styles.css';

export const metadata = {
  title: 'Open News Portal',
  description: 'Self-updating news portal with optional user accounts.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
