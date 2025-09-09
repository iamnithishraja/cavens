import React, { useState } from 'react';
import { Alert } from 'react-native';
import { useCameraPermissions } from 'expo-camera';
import apiClient from '@/app/api/client';
import type { CompleteOrderResponse } from '@/types/order';

// Import modular components
import QRScanner from '@/components/qr/QRScanner';
import OrderDetails from '@/components/qr/OrderDetails';
import QRScannerLanding from '@/components/qr/QRScannerLanding';
import PermissionScreen from '@/components/qr/PermissionScreen';
import LoadingScreen from '@/components/qr/LoadingScreen';

export default function QRScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [showCamera, setShowCamera] = useState(false);
  const [orderData, setOrderData] = useState<CompleteOrderResponse['data'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const handleQRScanned = async (qrData: string) => {
    try {
      // Extract order ID from QR data
      let orderId = qrData;
      
      // If QR contains JSON data, parse it
      if (qrData.startsWith('{')) {
        try {
          const parsedData = JSON.parse(qrData);
          orderId = parsedData.orderId || parsedData.id || qrData;
        } catch (e) {
          orderId = qrData;
        }
      }
      
      await completeOrder(orderId);
    } catch (error) {
      console.error('Error processing QR code:', error);
      Alert.alert('Error', 'Failed to process QR code. Please try again.');
      setIsScanning(false); // Re-enable scanning on error
    }
  };

  const completeOrder = async (orderId: string) => {
    setLoading(true);
    try {
      const response = await apiClient.post<CompleteOrderResponse>('/api/club/completeOrder', {
        orderId
      });

      if (response.data.success) {
        setOrderData(response.data.data);
        setShowCamera(false);
        setIsScanning(false);
        Alert.alert(
          'Success! 🎉',
          'Order completed successfully!',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Error', 
          response.data.message || 'Failed to complete order',
          [{ text: 'OK', onPress: () => setIsScanning(false) }]
        );
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to complete order. Please try again.';
      Alert.alert(
        'Error', 
        errorMessage,
        [{ text: 'OK', onPress: () => setIsScanning(false) }]
      );
    } finally {
      setLoading(false);
    }
  };

  const startScanning = () => {
    setShowCamera(true);
    setOrderData(null);
    setIsScanning(false); // Reset scanning state
  };

  const resetScanner = () => {
    setShowCamera(false);
    setOrderData(null);
    setIsScanning(false);
  };

  if (!permission) {
    return <LoadingScreen message="Initializing camera..." />;
  }

  if (!permission.granted) {
    return <PermissionScreen onRequestPermission={requestPermission} />;
  }

  if (orderData) {
    return (
      <OrderDetails 
        orderData={orderData} 
        onScanAgain={startScanning} 
        onClose={resetScanner} 
      />
    );
  }

  if (showCamera) {
    return (
      <QRScanner 
        onQRScanned={handleQRScanned}
        onClose={resetScanner}
        isScanning={isScanning}
        loading={loading}
      />
    );
  }

  return (
    <QRScannerLanding 
      onStartScanning={startScanning}
      loading={loading}
    />
  );
}
