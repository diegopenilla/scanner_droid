
## Video Projector Setup

```bash
sudo apt-get update
sudo apt-get install mplayer
```

## Audio Setup

Sets the audio output to go through the 3.5mm analog headphone/audio jack instead of HDMI.

```bash
amixer cset numid=3 1
```

## Printer Setup

```bash
# Update system packages
sudo apt update
sudo apt install cups

# Add user to printer admin group
sudo usermod -aG lpadmin pi

# Start and enable CUPS service
sudo systemctl start cups
sudo systemctl enable cups

# Edit CUPS configuration file
sudo nano /etc/cups/cupsd.conf
```

Add the following to the configuration file:
```
# Listen on localhost only
Listen localhost:631
# Add the following line for network access
Port 631

# Allow access (adjust your network range as needed)
<Location />
  Order allow,deny
  Allow localhost
  Allow from 192.168.1.0/24
</Location>
```

Install required Python packages:
```bash
# Install image processing library
pip3 install Pillow

# Install ESC/POS printer library
pip3 install python-escpos

# Install USB library
pip3 install pyusb
sudo apt install libusb-1.0-0-dev
```

Create USB device rules:
```bash
# Create a rules file for the receipt printer
sudo nano /etc/udev/rules.d/99-escpos.rules
```

Add this line to the rules file:
```
SUBSYSTEM=="usb", ATTR{idVendor}=="28e9", ATTR{idProduct}=="0289", MODE="0666"
```

Apply the new USB rules:
```bash
sudo udevadm control --reload-rules
sudo udevadm trigger
```