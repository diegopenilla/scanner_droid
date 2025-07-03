# Printer Scripts

This directory contains scripts for interfacing with USB thermal printers.

## Files:

- **`printer.py`** - Simple USB printer interface for text printing via device file
- **`print_image.py`** - Advanced thermal printer interface using python-escpos library
  - Supports both text and image printing
  - Handles monochrome image conversion and resizing
  - Configured for Vendor ID: 0x28e9, Product ID: 0x0289

## Requirements:
- USB thermal printer supporting ESC/POS commands
- python-escpos library (`pip install python-escpos`)
- PIL/Pillow library (`pip install Pillow`)
- Proper USB permissions (run as root/sudo or configure udev rules)

## Usage:
```bash
# Simple text printing
python3 printer.py

# Advanced printing with image support
python3 print_image.py
```

## Configuration:
- Update VENDOR_ID and PRODUCT_ID in print_image.py based on your printer (use `lsusb` command)
- Default image path: `/home/pi/Droid/utils/sample_image.jpg` 