# Bluetooth Scripts

This directory contains scripts for managing Bluetooth connectivity.

## Files:

- **`connect_be.sh`** - Automated Bluetooth speaker connection script for JBL Xtreme speaker
  - Handles Bluetooth power management
  - Automatically connects to specified MAC address
  - Restarts audio services for proper integration
  - Restarts the droid service after connection

## Configuration:
- Update `BT_DEVICE_MAC` variable in the script with your device's MAC address
- Default configured for MAC: FC:A8:9A:B7:4F:6E

## Usage:
```bash
./connect_be.sh
```

## Requirements:
- BlueZ Bluetooth stack
- PulseAudio
- Root/sudo privileges 