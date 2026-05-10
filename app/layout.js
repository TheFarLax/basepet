import './globals.css'

export const metadata = {
  title: 'BasePet',
  description: 'Feed daily. Protect your streak.'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}
