sudo apt update
sudo apt install cups

sudo usermod -aG lpadmin pi

sudo systemctl start cups
sudo systemctl enable cups

sudo nano /etc/cups/cupsd.conf
"""
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
"""

pip3 install Pillow

pip3 install python-escpos

sudo nano /etc/udev/rules.d/99-escpos.rules

SUBSYSTEM=="usb", ATTR{idVendor}=="28e9", ATTR{idProduct}=="0289", MODE="0666"

sudo udevadm control --reload-rules
sudo udevadm trigger


pip3 install pyusb
sudo apt install libusb-1.0-0-dev