#!/bin/bash
# bluetooth-autoconnect service 
# nano /etc/udev/rules.d/99-bt-autoconnect.rules.bak -> disabled -> UDEV RULE OTHER ALTERNATIVE to systemd script..

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