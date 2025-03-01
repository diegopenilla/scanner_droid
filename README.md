# Scanner Droid

> A collaborative project with Compressorhead.

The Droid is a mobile audiovisual robot made to deliver immersive experiences. It consists of a hoverboard, a battery, a projector, a Raspberry-Pi, an inverter and a couple of lasers. It's controlled via a remote control and a [web-based application](https://github.com/diegopenilla/scanner_droid). 

The droid combines several technologies into onec platform:
- A video beamer projector displays images and videos on surrounding surfaces
- RC-controlled motors enable movement throughout performance spaces
- Built-in speakers deliver clear audio playback for voice and sound effects
- A small thermal printer, cleverly positioned as the droid's "mouth," prints custom messages for audience members



<image src="https://res.cloudinary.com/dn6icdd6e/image/upload/v1731267270/website/k9e8votfahe82wgtfdfq.jpg"/>

<br>

The droid moves seamlessly through spaces, engaging audiences through voice recordings, dynamic music, and immersive videos.  

<div align='center'>
<image src="https://res.cloudinary.com/dn6icdd6e/image/upload/v1731176633/website/uhpedjffuipfhl6vlcbn.jpg
">
<em> The droid display videos through a projector attached on its head. </em>
</div>
<br>

Still in his early days, the droid has already performed at the at-tension theather festival and at the Circus Mond in Germany.

<div align='center'>
<img src="https://res.cloudinary.com/dn6icdd6e/image/upload/f_auto/v1731266076/website/jwckrieshvo882tnvjw4.heic" alt="Converted Image">

<em> Droid performing at Circus Mond</em>
</div>


### Motion Control

An RC Controller moves the hoverboard and the droid. A button activates the motor to tilt the head up and down for aiming the projector.



<video width="560" height="315" controls>
  <source src="https://res.cloudinary.com/dn6icdd6e/video/upload/v1731176308/website/iufwdytwhiqlupbbnlf6.mov" type="video/mp4">
</video>


### Media Control

   A Web App is used to control the media played by the droid. The app allows to play, stop and upload video and audio tracks to the droid.

<video width="560" height="315" controls>
  <source src="https://res.cloudinary.com/dn6icdd6e/video/upload/v1731176438/website/scbpmt4tl1cuz2z0yhzs.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>


<br>




https://res.cloudinary.com/dn6icdd6e/video/upload/v1731176623/website/hgwdtyk5phv9jxfrqfhz.mov



____

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