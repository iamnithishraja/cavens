package com.nithishraja.cavens;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Context;
import android.os.Build;
import androidx.core.app.NotificationCompat;

public class NotificationChannelSetup {
    
    public static void createNotificationChannels(Context context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager notificationManager = 
                (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
            
            // High importance channel for heads-up notifications
            NotificationChannel highImportanceChannel = new NotificationChannel(
                "high_importance_channel",
                "High Importance Notifications",
                NotificationManager.IMPORTANCE_HIGH
            );
            
            // Enable heads-up notifications
            highImportanceChannel.setShowBadge(true);
            highImportanceChannel.enableLights(true);
            highImportanceChannel.enableVibration(true);
            highImportanceChannel.setLockscreenVisibility(NotificationCompat.VISIBILITY_PUBLIC);
            
            // Set notification color
            highImportanceChannel.setLightColor(android.graphics.Color.parseColor("#8B5CF6"));
            
            // Set sound for heads-up notifications
            highImportanceChannel.setSound(
                android.provider.Settings.System.DEFAULT_NOTIFICATION_URI,
                null
            );
            
            notificationManager.createNotificationChannel(highImportanceChannel);
            
            // Club notifications channel (for backend compatibility)
            NotificationChannel clubChannel = new NotificationChannel(
                "club_notifications",
                "Club Notifications",
                NotificationManager.IMPORTANCE_HIGH
            );
            
            clubChannel.setShowBadge(true);
            clubChannel.enableLights(true);
            clubChannel.enableVibration(true);
            clubChannel.setLockscreenVisibility(NotificationCompat.VISIBILITY_PUBLIC);
            clubChannel.setLightColor(android.graphics.Color.parseColor("#FF6B35"));
            clubChannel.setSound(
                android.provider.Settings.System.DEFAULT_NOTIFICATION_URI,
                null
            );
            
            notificationManager.createNotificationChannel(clubChannel);
            
            // Default channel for regular notifications
            NotificationChannel defaultChannel = new NotificationChannel(
                "default_channel",
                "Default Notifications",
                NotificationManager.IMPORTANCE_DEFAULT
            );
            
            defaultChannel.setShowBadge(true);
            defaultChannel.enableLights(true);
            defaultChannel.enableVibration(true);
            
            notificationManager.createNotificationChannel(defaultChannel);
        }
    }
}
