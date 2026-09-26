# Welcome to your Lovable project

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Open your project in the [Lovable editor](https://lovable.dev) and keep building.

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: connect the project to GitHub and every change made in Lovable is committed straight to your repository.
- **Full ownership**: this code is yours. Push to your repository and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Firebase setup

The app uses Firebase Authentication and Cloud Firestore. In the Firebase console:

1. Enable the Email/Password sign-in provider.
2. Create a Firestore database.
3. Deploy `firestore.rules` with `firebase deploy --only firestore:rules`.
4. Create a service account and set `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY` in your local environment and hosting provider. See `.env.example` for the expected format.

The first visit to `/auth` creates the super-admin account. Existing Supabase users and receipts are not copied automatically.

## Built with

- TanStack Start
- TypeScript
- React
- Tailwind CSS
