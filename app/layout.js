export const metadata = {
    title: 'Hotel Venue Scraper',
    description: 'Extract meeting rooms, floor plans, and venue data from hotel websites',
};

export default function RootLayout({ children }) {
    return (
          <html lang="en">
            <body style={{ margin: 0, backgroundColor: '#fafafa' }}>{children}</body>
  </html>
  );
}
