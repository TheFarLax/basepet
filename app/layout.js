import './globals.css'

export const metadata = {
  title: 'BasePet',
  description: 'Feed daily. Protect your streak.'
}

export default function RootLayout({
  children
}) {
  return (
    <html lang="en">

      <head>
        <meta
          name="base:app_id"
          content="6a00a3de9ee68cd142d1b087"
        />
      </head>

      <body>
        {children}
      </body>

    </html>
  )
}
