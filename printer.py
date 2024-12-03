import os

def print_to_usb_printer(message):
    # Path to the USB printer device
    printer_device = '/dev/usb/lp0'

    try:
        # Open the device file and write the message
        with open(printer_device, 'w') as printer:
            printer.write(message + '\n')
        print("Message sent to printer successfully.")
    except PermissionError:
        print("Permission denied. Please run this script as root or with sudo.")
    except FileNotFoundError:
        print(f"Printer device not found at {printer_device}. Make sure it's connected.")
    except Exception as e:
        print(f"An error occurred: {e}")

# Get user input and send to printer
if __name__ == "__main__":
    message = input("Enter the message to print: ")
    print_to_usb_printer(message)