import sys
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
    """Main function to handle command-line arguments and run the printer tasks."""
    if len(sys.argv) < 3:
        print("Usage: python print_image.py [text|image] <message|image_path>")
        sys.exit(1)

    option = sys.argv[1].lower()
    value = sys.argv[2]

    if option == 'text':
        print_text_to_usb_printer(value)
    elif option == 'image':
        print_image_to_usb_printer(value)
    else:
        print("Invalid option. Use 'text' for printing text or 'image' for printing an image.")
        sys.exit(1)

if __name__ == "__main__":
    main()