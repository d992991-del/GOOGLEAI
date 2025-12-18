
import { initializeApp, getApps } from 'firebase/app';
import type { FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import type { Auth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';

/**
 * [重要] Firebase 配置區塊
 * 您可以將從 Firebase Console 取得的配置貼在此處，
 * 這樣就不需要透過 GitHub Secrets 也能直接運行與部屬。
 */
const PUBLIC_FIREBASE_CONFIG = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const getFirebaseConfig = () => {
  // 1. 優先嘗試從環境變數讀取 (GitHub Actions / Vite Define)
  try {
    const configStr = process.env.FIREBASE_CONFIG;
    if (configStr && configStr !== '{}') {
      return JSON.parse(configStr);
    }
  } catch (e) {
    console.warn("無法從環境變數讀取 Firebase 配置。");
  }

  // 2. 如果環境變數不存在，且硬編碼區塊已填寫，則使用硬編碼內容
  // 檢查是否仍然是預設值
  if (PUBLIC_FIREBASE_CONFIG.apiKey !== "YOUR_API_KEY") {
    return PUBLIC_FIREBASE_CONFIG;
  }

  return null;
};

const config = getFirebaseConfig();
export const isFirebaseEnabled = config !== null;

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

if (isFirebaseEnabled && config) {
  try {
    app = getApps().length === 0 ? initializeApp(config) : getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (error) {
    console.error("Firebase 初始化失敗:", error);
  }
}

export { auth, db };
