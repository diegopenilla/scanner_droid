#!/bin/bash
# =============================================================================
# Bluetooth SpeakerAuto-Connect Script
# =============================================================================
#
# This script automatically connects to a specified JBL Xtreme Bluetooth speaker
# and sets up audio systems after connection. It performs the following tasks:
#
# 1. Powers on the Bluetooth adapter
# 2. Sets up Bluetooth agent
# 3. Makes the device pairable
# 4. Connects to the specified Bluetooth device MAC address
# 5. Sets the device as trusted for future auto-connections
# 6. Restarts PulseAudio to properly recognize the new audio sink
# 7. Restarts Bluetooth service
# 8. Restarts the Droid service
#
# Configuration:
# - BT_DEVICE_MAC: Set to the MAC address of your Bluetooth device
#
# Usage:
#   ./bluetooth_autoconnect.sh
#
# Note: This script is an alternative to using udev rules for Bluetooth
# auto-connection (reference: /etc/udev/rules.d/99-bt-autoconnect.rules.bak)
# =============================================================================

# MAC address of the Bluetooth device (JBL Xtreme)
BT_DEVICE_MAC="FC:A8:9A:B7:4F:6E"

# Turn on Bluetooth power
bluetoothctl power on
sleep 2

# Register agent and set as default
bluetoothctl agent on
sleep 2
bluetoothctl default-agent
sleep 2

# Make the device pairable (if needed)
bluetoothctl pairable on
sleep 2

# Attempt to connect to the Bluetooth device
bluetoothctl connect $BT_DEVICE_MAC
sleep 2

# Optionally, set the device as trusted to auto-connect in the future
bluetoothctl trust $BT_DEVICE_MAC

# NOW RESTART PULSE AUDIO TO SHOW SINK
pulseaudio -k


# Restart the Bluetooth service
sudo systemctl restart bluetooth
sleep 2

# Start PulseAudio
pulseaudio --start

sudo systemctl restart droid