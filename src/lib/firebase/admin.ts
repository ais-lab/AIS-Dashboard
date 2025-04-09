// import { cert, getApps, initializeApp } from "firebase-admin/app"
// import { getAuth } from "firebase-admin/auth"
// import { getFirestore } from "firebase-admin/firestore"

// import { env } from "@/env.mjs"

// const firebaseApp = getApps().length
//   ? getApps()[0]
//   : initializeApp({
//       credential: cert({
//         projectId: env.ADMIN_PROJECT_ID,
//         clientEmail: env.ADMIN_CLIENT_EMAIL,
//         privateKey: env.ADMIN_PRIVATE_KEY,
//       }),
//     })

// const auth = getAuth(firebaseApp)
// const firestore = getFirestore(firebaseApp)

// export { firebaseApp, auth as adminAuth, firestore as adminFirestore }
