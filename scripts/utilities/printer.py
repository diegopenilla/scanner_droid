import sys
from escpos.printer import Usb

# Configuration consistent with print_image.py
VENDOR_ID = 0x28e9
PRODUCT_ID = 0x0289

def print_text(message):
    try:
        # Initialize USB printer with explicit interface and endpoint
        p = Usb(VENDOR_ID, PRODUCT_ID, interface=0, out_ep=0x03)
        p.text(message + '\n')
        p.cut()
        print("Message sent to printer successfully.")
    except Exception as e:
        print(f"Error printing: {e}")
        print("Ensure you have permissions (try sudo) and the printer is connected.")

if __name__ == "__main__":
    print("--- Manual Printer Tool ---")
    if len(sys.argv) > 1:
        msg = " ".join(sys.argv[1:])
    else:
        msg = input("Enter message to print: ")
    
    if msg:
        print_text(msg)
    else:
        print("No message provided.")
