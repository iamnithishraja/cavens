import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

interface TicketCounterProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

const TicketCounter: React.FC<TicketCounterProps> = ({
  value,
  onChange,
  min = 1,
  max = 10
}) => {
  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  const canDecrement = value > min;
  const canIncrement = value < max;

  return (
    <View style={styles.container}>
      <View style={styles.counterContainer}>
        <TouchableOpacity
          style={[
            styles.counterButton,
            styles.decrementButton,
            !canDecrement && styles.disabledButton
          ]}
          onPress={handleDecrement}
          disabled={!canDecrement}
          activeOpacity={0.8}
        >
          <Text style={[
            styles.counterButtonText,
            !canDecrement && styles.disabledButtonText
          ]}>
            −
          </Text>
        </TouchableOpacity>

        <View style={styles.valueContainer}>
          <Text style={styles.valueText}>{value}</Text>
        </View>

        <TouchableOpacity
          style={[
            styles.counterButton,
            styles.incrementButton,
            !canIncrement && styles.disabledButton
          ]}
          onPress={handleIncrement}
          disabled={!canIncrement}
          activeOpacity={0.8}
        >
          <Text style={[
            styles.counterButtonText,
            styles.incrementButtonText,
            !canIncrement && styles.disabledButtonText
          ]}>
            +
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          Min: {min} • Max: {max}
        </Text>
        {value === max && (
          <Text style={styles.limitText}>Maximum tickets reached</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.withOpacity.white10,
    overflow: 'hidden',
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  counterButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: Colors.withOpacity.white10,
  },
  decrementButton: {
    backgroundColor: Colors.backgroundTertiary,
    borderTopLeftRadius: 11,
    borderBottomLeftRadius: 11,
  },
  incrementButton: {
    backgroundColor: Colors.primary,
    borderTopRightRadius: 11,
    borderBottomRightRadius: 11,
  },
  disabledButton: {
    backgroundColor: Colors.backgroundTertiary,
    opacity: 0.5,
  },
  counterButtonText: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 20,
    color: Colors.textPrimary,
  },
  incrementButtonText: {
    color: Colors.button.text, // Black text on gold background
    fontWeight: '700',
  },
  disabledButtonText: {
    color: Colors.textMuted,
  },
  valueContainer: {
    width: 60,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: Colors.withOpacity.white10,
  },
  valueText: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  infoContainer: {
    marginTop: 12,
    alignItems: 'center',
  },
  infoText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  limitText: {
    color: Colors.error,
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
    opacity: 0.9,
  },
});
export default TicketCounter;