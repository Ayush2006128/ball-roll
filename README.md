# Ball Roll

A 3D endless space runner built with Next.js, React Three Fiber, and Three.js.

## Setup

```bash
npm install
```

Create `.env.local` with the VAPID keys used for web push:
```bash
npm install -g web-push
```

then run
```bash
web-push generate-vapid-keys
```

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=paste-public-key
VAPID_PRIVATE_KEY=paste-private-key
```

Keep the private key server-side and do not commit `.env.local`.

## Development

```bash
npm run dev
```

Open <http://localhost:3000>.

Run validation with:

```bash
npm run lint
npx tsc --noEmit
```

## Production

```bash
npm run build
npm start
```

The PWA service worker is registered from `/sw.js`. Service workers, installation, and push notifications require HTTPS in production, except on localhost. The worker caches same-origin app assets and checks for updated versions automatically.

Push subscription storage and notification sending require a server endpoint and persistent datastore; VAPID keys alone do not send notifications.