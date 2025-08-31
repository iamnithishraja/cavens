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
            !canDecrement && styles.disabledButton
          ]}
          onPress={handleDecrement}
          disabled={!canDecrement}
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
            !canIncrement && styles.disabledButton
          ]}
          onPress={handleIncrement}
          disabled={!canIncrement}
        >
          <Text style={[
            styles.counterButtonText,
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
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.withOpacity.white10,
    overflow: 'hidden',
  },
  counterButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primary,
  },
  disabledButton: {
    backgroundColor: Colors.backgroundTertiary,
  },
  counterButtonText: {
    color: Colors.textPrimary,
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 24,
  },
  disabledButtonText: {
    color: Colors.textMuted,
  },
  valueContainer: {
    width: 80,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
  },
  valueText: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
  },
  infoContainer: {
    marginTop: 12,
    alignItems: 'center',
  },
  infoText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  limitText: {
    color: Colors.error,
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
});

export default TicketCounter;
