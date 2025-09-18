
import { getMessaging } from '@react-native-firebase/messaging';
import { getApp } from '@react-native-firebase/app';

const app = getApp();
const messaging = getMessaging(app);

export { messaging };
