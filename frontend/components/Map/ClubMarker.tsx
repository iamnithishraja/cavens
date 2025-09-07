import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';

interface Props {
  title: string;
  image?: string | null;
  size?: number;
  theme?: 'light' | 'dark';
}

const ClubMarker = ({ title, image, size = 50, theme = 'dark' }: Props) => {
  // Generate a color based on the club name for variety
  const getMarkerColor = (clubName: string) => {
    const colors = [
      '#4F46E5', // Indigo
      '#EC4899', // Pink
      '#10B981', // Emerald
      '#F59E0B', // Amber
      '#EF4444', // Red
      '#8B5CF6', // Violet
      '#06B6D4', // Cyan
      '#84CC16', // Lime
      '#F97316', // Orange
      '#6366F1', // Indigo-400
    ];
    
    if (!clubName) return colors[0];
    
    let hash = 0;
    for (let i = 0; i < clubName.length; i++) {
      hash = clubName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  // Generate a border color that's different from the background color
  const getBorderColor = (clubName: string) => {
    const borderColors = [
      '#FFFFFF', // White
      '#FFD700', // Gold
      '#FF6B6B', // Light Red
      '#4ECDC4', // Teal
      '#45B7D1', // Sky Blue
      '#96CEB4', // Mint Green
      '#FFEAA7', // Light Yellow
      '#DDA0DD', // Plum
      '#98D8C8', // Mint
      '#F7DC6F', // Light Gold
    ];
    
    if (!clubName) return borderColors[0];
    
    let hash = 0;
    for (let i = 0; i < clubName.length; i++) {
      hash = clubName.charCodeAt(i) + ((hash << 7) - hash);
    }
    const index = Math.abs(hash) % borderColors.length;
    return borderColors[index];
  };

  const markerColor = getMarkerColor(title);
  const borderColor = getBorderColor(title);
  const displayName = (title || 'Club').trim();
  
  // Calculate exact sizes to ensure consistency
  const containerSize = size;
  const borderWidth = 3;
  const imageSize = containerSize - (borderWidth * 2);
  const borderRadius = containerSize / 2;

  const containerStyle = {
    width: containerSize,
    height: containerSize,
  };

  const circleStyle = {
    width: containerSize,
    height: containerSize,
    borderRadius: borderRadius,
    backgroundColor: markerColor,
    borderColor: borderColor,
    borderWidth: borderWidth,
  };

  // inner mask handles exact sizing; keep computed values above for clarity

  const textStyle = {
    fontSize: Math.max(containerSize / 3, 12),
  };

  return (
    <View 
      style={[styles.container, containerStyle]} 
      pointerEvents="none"
      collapsable={false}
      renderToHardwareTextureAndroid
    >
      <View style={[styles.circle, circleStyle]}>
        <View style={[styles.innerMask, { width: imageSize, height: imageSize, borderRadius: imageSize / 2 }] }>
          {image ? (
            <Image
              source={{ uri: image }}
              style={styles.imageFill}
            />
          ) : (
            <Text style={[styles.fallback, textStyle]}>
              {displayName.charAt(0).toUpperCase()}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  circle: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  innerMask: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageFill: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  fallback: {
    color: '#FFFFFF',
    fontWeight: '800',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default ClubMarker;