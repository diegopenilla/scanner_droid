# Enabling Internet & Connectivity (AutoHotspot Method)

This guide explains how to configure the Droid (Raspberry Pi) to automatically switch between **Client Mode** (Connecting to your phone/home Wi-Fi) and **Access Point Mode** (Creating its own Wi-Fi) depending on availability.

This setup uses a script commonly known as **AutoHotspot**.

## 1. Prerequisites
- Raspberry Pi 3, 4, or Zero W (built-in Wi-Fi).
- Raspberry Pi OS (Buster or newer recommended).
- Internet connection on the Pi (via Ethernet or temporary Wi-Fi) for initial setup.

## 2. Concept
- **Scenario A (Internet):** Pi boots -> Sees your Phone Hotspot -> Connects.
    - **Access:** `http://sonydroid.local:3000`
    - **Internet:** YES (for APIs).
- **Scenario B (Field/Offline):** Pi boots -> No known networks -> Creates `SonyDroid_AP`.
    - **Access:** `http://192.168.50.5:3000` (or similar static IP).
    - **Internet:** NO.

## 3. Installation Steps

### A. Install Required Packages
The script relies on `hostapd` (for creating the hotspot) and `dnsmasq` (for assigning IPs).

```bash
sudo apt update
sudo apt install hostapd dnsmasq -y
```

### B. Unmask and Disable Hostapd (Default State)
We want `hostapd` to be *off* by default, so the script can turn it on only when needed.

```bash
sudo systemctl unmask hostapd
sudo systemctl disable hostapd
sudo systemctl stop hostapd
```

### C. Configure `hostapd.conf` (The Hotspot Settings)
Create/Edit the file `/etc/hostapd/hostapd.conf`:

```bash
interface=wlan0
driver=nl80211
ssid=SonyDroid_AP
hw_mode=g
channel=7
wmm_enabled=0
macaddr_acl=0
auth_algs=1
ignore_broadcast_ssid=0
wpa=2
wpa_passphrase=droid1234
wpa_key_mgmt=WPA-PSK
wpa_pairwise=TKIP
rsn_pairwise=CCMP
```

### D. Configure `wpa_supplicant.conf` (Your Known Networks)
Edit `/etc/wpa_supplicant/wpa_supplicant.conf` to add your phone/home networks.

```bash
ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
update_config=1
country=US

network={
    ssid="MyPhoneHotspot"
    psk="MyPhonePassword"
    priority=100
    id_str="hotspot"
}

network={
    ssid="HomeWiFi"
    psk="HomePassword"
    priority=90
    id_str="home"
}
```

### E. Download the AutoHotspot Script
We will use a standard approach for the script.
1.  Create the file: `sudo nano /usr/bin/autohotspot`
2.  Paste the script content (See Section 4 below).
3.  Make it executable: `sudo chmod +x /usr/bin/autohotspot`

### F. Create the Systemd Service
Create a service to run this at boot.
File: `/etc/systemd/system/autohotspot.service`

```ini
[Unit]
Description=Automatically generates an Internet Hotspot when no active wifi connection is found
After=multi-user.target

[Service]
Type=oneshot
RemainAfterExit=yes
ExecStart=/usr/bin/autohotspot

[Install]
WantedBy=multi-user.target
```

Enable it: `sudo systemctl enable autohotspot.service`

## 4. The AutoHotspot Script Content
Paste this into `/usr/bin/autohotspot`:

```bash
#!/bin/bash
#version 0.96-N/HS-I

#Scanning for known SSIDs
ssids=$(sudo grep ssid /etc/wpa_supplicant/wpa_supplicant.conf | cut -d '"' -f 2)
connected=false

for ssid in $ssids
do
    if sudo iwlist wlan0 scan | grep "$ssid" > /dev/null
    then
        echo "Known network $ssid found. Connecting..."
        connected=true
        break
    fi
done

if [ "$connected" = false ]; then
    echo "No known network found. Creating Hotspot..."
    sudo systemctl start hostapd
    sudo service dnsmasq start
else
    echo "Connecting to Wi-Fi..."
    sudo systemctl stop hostapd
    sudo service dnsmasq stop
    sudo wpa_cli -i wlan0 reconfigure
fi
```

*Note: This is a simplified logic version. For the full robust script often used in the community, refer to repositories like "RaspberryConnect" or similar `autohotspot` implementations.*

## 5. Accessing the Droid
- **If connected to Phone:** Use `http://sonydroid.local:3000`
- **If connected to Droid AP:** Use the static IP configured in `/etc/dhcpcd.conf` (usually `192.168.4.1` or `192.168.50.5`).
