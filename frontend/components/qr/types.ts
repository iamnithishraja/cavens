import type { CompleteOrderResponse } from '@/types/order';

export interface QRScannerProps {
  onQRScanned: (data: string) => void;
  onClose: () => void;
  isScanning: boolean;
  loading: boolean;
}

export interface OrderDetailsProps {
  orderData: CompleteOrderResponse['data'];
  onScanAgain: () => void;
  onClose: () => void;
}

export interface QRScannerLandingProps {
  onStartScanning: () => void;
  loading: boolean;
}

export interface PermissionScreenProps {
  onRequestPermission: () => void;
}

export interface LoadingScreenProps {
  message?: string;
}
