import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { qrStyles } from './styles';
import type { OrderDetailsProps } from './types';

export default function OrderDetails({ orderData, onScanAgain, onClose }: OrderDetailsProps) {
  return (
    <SafeAreaView style={qrStyles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      <LinearGradient colors={Colors.gradients.background as [string, string]} style={qrStyles.container}>
        {/* Header */}
        <View style={qrStyles.header}>
          <TouchableOpacity style={qrStyles.headerBackButton} onPress={onClose}>
            <Ionicons name="arrow-back" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={qrStyles.headerTitle}>Order Details</Text>
          <View style={qrStyles.spacer} />
        </View>

        <ScrollView style={qrStyles.scrollContainer} contentContainerStyle={qrStyles.scrollContent}>
          {/* Success Badge */}
          <View style={qrStyles.successBadge}>
            <LinearGradient
              colors={['#00FF87', '#60EFFF']}
              style={qrStyles.successBadgeGradient}
            >
              <Ionicons name="checkmark-circle" size={32} color="#000" />
              <Text style={qrStyles.successText}>Order Completed Successfully!</Text>
            </LinearGradient>
          </View>

          {/* Event Info */}
          <View style={qrStyles.section}>
            <Text style={qrStyles.sectionTitle}>Event Information</Text>
            <View style={qrStyles.eventCard}>
              {orderData.eventDetails.coverImage && (
                <Image 
                  source={{ uri: orderData.eventDetails.coverImage }} 
                  style={qrStyles.eventImage}
                  resizeMode="cover"
                />
              )}
              <View style={qrStyles.eventInfo}>
                <Text style={qrStyles.eventName}>{orderData.eventDetails.name}</Text>
                <Text style={qrStyles.eventDateTime}>
                  {orderData.eventDetails.date} • {orderData.eventDetails.time}
                </Text>
                {orderData.eventDetails.djArtists && (
                  <Text style={qrStyles.eventDetail}>
                    <Text style={qrStyles.label}>DJ/Artists:</Text> {orderData.eventDetails.djArtists}
                  </Text>
                )}
                {orderData.eventDetails.description && (
                  <Text style={qrStyles.eventDescription}>{orderData.eventDetails.description}</Text>
                )}
              </View>
            </View>
          </View>

          {/* Ticket Details */}
          <View style={qrStyles.section}>
            <Text style={qrStyles.sectionTitle}>Ticket Details</Text>
            <View style={qrStyles.ticketCard}>
              <View style={qrStyles.ticketRow}>
                <Text style={qrStyles.ticketLabel}>Type:</Text>
                <Text style={qrStyles.ticketValue}>{orderData.ticketDetails.name}</Text>
              </View>
              <View style={qrStyles.ticketRow}>
                <Text style={qrStyles.ticketLabel}>Quantity:</Text>
                <Text style={qrStyles.ticketValue}>{orderData.order.quantity}</Text>
              </View>
              <View style={qrStyles.ticketRow}>
                <Text style={qrStyles.ticketLabel}>Price per Ticket:</Text>
                <Text style={qrStyles.ticketValue}>AED {orderData.ticketDetails.price}</Text>
              </View>
              <View style={qrStyles.ticketRow}>
                <Text style={qrStyles.ticketLabel}>Total Amount:</Text>
                <Text style={qrStyles.totalAmount}>
                  AED {(orderData.ticketDetails.price * orderData.order.quantity).toFixed(2)}
                </Text>
              </View>
            </View>
          </View>

          {/* Guest Experience */}
          {orderData.eventDetails.guestExperience && (
            <View style={qrStyles.section}>
              <Text style={qrStyles.sectionTitle}>Guest Experience</Text>
              <View style={qrStyles.experienceCard}>
                {orderData.eventDetails.guestExperience.dressCode && (
                  <View style={qrStyles.experienceRow}>
                    <Text style={qrStyles.experienceLabel}>Dress Code:</Text>
                    <Text style={qrStyles.experienceValue}>{orderData.eventDetails.guestExperience.dressCode}</Text>
                  </View>
                )}
                {orderData.eventDetails.guestExperience.entryRules && (
                  <View style={qrStyles.experienceRow}>
                    <Text style={qrStyles.experienceLabel}>Entry Rules:</Text>
                    <Text style={qrStyles.experienceValue}>{orderData.eventDetails.guestExperience.entryRules}</Text>
                  </View>
                )}
                {orderData.eventDetails.guestExperience.parkingInfo && (
                  <View style={qrStyles.experienceRow}>
                    <Text style={qrStyles.experienceLabel}>Parking:</Text>
                    <Text style={qrStyles.experienceValue}>{orderData.eventDetails.guestExperience.parkingInfo}</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Order Details */}
          <View style={qrStyles.section}>
            <Text style={qrStyles.sectionTitle}>Order Information</Text>
            <View style={qrStyles.orderCard}>
              <View style={qrStyles.orderRow}>
                <Text style={qrStyles.orderLabel}>Order ID:</Text>
                <Text style={qrStyles.orderValue}>{orderData.order._id.slice(-8).toUpperCase()}</Text>
              </View>
              <View style={qrStyles.orderRow}>
                <Text style={qrStyles.orderLabel}>Transaction ID:</Text>
                <Text style={qrStyles.orderValue}>{orderData.order.transactionId.slice(-8).toUpperCase()}</Text>
              </View>
              <View style={qrStyles.orderRow}>
                <Text style={qrStyles.orderLabel}>Scan Time:</Text>
                <Text style={qrStyles.orderValue}>
                  {new Date(orderData.scanTime).toLocaleString()}
                </Text>
              </View>
              <View style={qrStyles.orderRow}>
                <Text style={qrStyles.orderLabel}>Status:</Text>
                <View style={qrStyles.statusBadge}>
                  <Text style={qrStyles.statusText}>{orderData.orderStatus}</Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={qrStyles.bottomContainer}>
          <TouchableOpacity style={qrStyles.scanAgainButton} onPress={onScanAgain}>
            <LinearGradient
              colors={[Colors.primary, '#4A9EFF']}
              style={qrStyles.scanAgainButtonGradient}
            >
              <Ionicons name="qr-code" size={20} color="#000" />
              <Text style={qrStyles.scanAgainText}>Scan Another Ticket</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}
