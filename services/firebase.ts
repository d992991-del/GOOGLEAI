
// Consolidate Firebase imports and properly export the Auth type to resolve compilation errors
import { initializeApp, getApps } from 'firebase/app';
import type { FirebaseApp } from 'firebase/app';
// Separate value and type imports to ensure better compatibility with various TypeScript/Vite configurations
import { getAuth } from 'firebase/auth';
import type { Auth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';

/**
 * 🚀 直接在這裡貼上您的 Firebase 配置
 * 這樣您就不需要去 GitHub 設定 Secrets，方便後續快速開發。
 */
const PUBLIC_FIREBASE_CONFIG = {
  apiKey: "您的_API_KEY",
  authDomain: "您的_PROJECT_ID.firebaseapp.com",
  projectId: "您的_PROJECT_ID",
  storageBucket: "您的_PROJECT_ID.appspot.com",
  messagingSenderId: "您的_SENDER_ID",
  appId: "您的_APP_ID"
};

const getFirebaseConfig = () => {
  // 優先檢查是否有透過 Vite 注入的環境變數 (例如 GitHub Actions 傳入)
  try {
    const configStr = process.env.FIREBASE_CONFIG;
    if (configStr && configStr !== '{}' && configStr !== 'undefined') {
      return JSON.parse(configStr);
    }
  } catch (e) {
    // 忽略解析錯誤
  }

  // 如果環境變數不存在，檢查硬編碼區塊是否已填寫 (不是預設提示字串)
  if (PUBLIC_FIREBASE_CONFIG.apiKey && !PUBLIC_FIREBASE_CONFIG.apiKey.includes("您的")) {
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
