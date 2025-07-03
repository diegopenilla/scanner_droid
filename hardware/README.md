# Hardware Scripts

This directory contains scripts for interfacing with hardware components on the Raspberry Pi.

## Files:

- **`rc_pwm_trigger.py`** - Servo pulse width monitor for debugging servo signals and measuring pulse widths from 1000µs to 2000µs
- **`signal_reader.py`** - GPIO signal reader using pigpio to measure pulse widths and detect signal activity

## Requirements:
- Raspberry Pi with pigpio daemon running (`sudo pigpiod`)
- GPIO connections as specified in each script
- Python3 with pigpio library installed

## Usage:
Run each script individually based on your hardware monitoring needs. 