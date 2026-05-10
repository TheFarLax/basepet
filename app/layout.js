import './globals.css'

export const metadata = {
  title: 'BasePet',
  description: 'Feed daily. Protect your streak.',
  metadataBase: new URL(
    'https://petonbase.vercel.app'
  ),
  other: {
    'base:app_id':
      '6a00a3de9ee68cd142d1b087'
  }
}

export default function RootLayout({
  children
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}
