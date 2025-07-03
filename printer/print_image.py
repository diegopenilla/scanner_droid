"""
USB Thermal Printer Interface

This module provides functions to print text and images to a USB thermal printer 
using the python-escpos library. It is designed for use with thermal receipt 
printers that support ESC/POS commands.

The script identifies the printer using its USB Vendor ID and Product ID, which 
should be obtained from the 'lsusb' command on Linux systems. The default values 
are set for a specific thermal printer model (Vendor ID: 0x28e9, Product ID: 0x0289).

Requirements:
- python-escpos library (install with: pip install python-escpos)
- PIL/Pillow library (install with: pip install Pillow)
- Proper USB permissions (either run as root/sudo or set up udev rules)

Usage:
 - Run the script and choose between text or image printing
 - For text: Enter the message to print
 - For images: The script will print a predefined image path (/home/pi/Droid/epa.jpg)

Note: Images are automatically converted to monochrome and resized to fit the 
printer's capabilities (typically 384 pixels wide for thermal receipt printers).
"""

from escpos.printer import Usb
from PIL import Image

# Replace with the Vendor ID and Product ID from lsusb
VENDOR_ID = 0x28e9
PRODUCT_ID = 0x0289

def print_text_to_usb_printer(message):
    """Prints text to the USB printer."""
    try:
        # Initialize USB printer with explicit interface and endpoint
        p = Usb(VENDOR_ID, PRODUCT_ID, interface=0, out_ep=0x03)
        p.text(message + '\n')
        p.cut()
        print("Message sent to printer successfully.")
    except PermissionError:
        print("Permission denied. Please run this script as root or with sudo.")
    except FileNotFoundError:
        print("Printer device not found. Make sure it's connected.")
    except Exception as e:
        print(f"An error occurred: {e}")

def print_image_to_usb_printer(image_path):
    """Prints an image to the USB printer."""
    try:
        # Initialize USB printer with explicit interface and endpoint
        p = Usb(VENDOR_ID, PRODUCT_ID, interface=0, out_ep=0x03)

        with Image.open(image_path) as img:
            img = img.convert('1')  # Convert to monochrome (1-bit)
            img = img.resize((384, int(img.height * (384 / img.width))))  # Match printer width specs if necessary
            p.image(img)
            p.cut()
            print("Image sent to printer successfully.")
    except FileNotFoundError:
        print(f"Image file not found at {image_path}.")
    except PermissionError:
        print("Permission denied. Please run this script as root or with sudo.")
    except Exception as e:
        print(f"An error occurred: {e}")

def main():
    """Main function to run the printer program."""
    option = input("Enter 'text' to print a message or 'image' to print an image: ").strip().lower()
    if option == 'text':
        message = input("Enter the message to print: ")
        print_text_to_usb_printer(message)
    elif option == 'image':
        image_path = "/home/pi/Droid/utils/sample_image.jpg"  # Use specified image path
        print_image_to_usb_printer(image_path)
    else:
        print("Invalid option. Please enter 'text' or 'image'.")

if __name__ == "__main__":
    main()