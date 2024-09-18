#!/bin/bash
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
DROID_CONTROL_DIR=$(realpath $SCRIPT_DIR/..)


echo ""
echo "Setup Droid Service..."
echo "=============================="

sudo cp $DROID_CONTROL_DIR/scripts/services/droid.service /etc/systemd/system/droid.service
sudo chmod +x $DROID_CONTROL_DIR/scripts/run_droid_service.sh
systemctl enable droid

#-------------------------------------------------------------------
echo ""
echo "Reboot to complete installation"
echo "=============================="